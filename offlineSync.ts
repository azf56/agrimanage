import { 
  Owner, Land, WaterSource, Visit, LabAnalysis, Task, Message, LookupItem, User,
  OfflineQueueItem, SyncPushPayload, SyncPullResponse 
} from './types';
import { defaultLookupItems } from './defaultLookups';

const LOCAL_STORAGE_PREFIX = 'agri_pwa_';
const QUEUE_STORAGE_KEY = 'agri_offline_queue_v1';
const LAST_SYNC_KEY = 'agri_last_sync_timestamp';
const DEVICE_ID_KEY = 'agri_device_unique_id';

// Generate or retrieve persistent device UUID
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// Check network connectivity
export async function testServerConnection(apiUrl: string = '/api'): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${apiUrl}/status`, { 
      method: 'GET', 
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    return false;
  }
}

// --- Local Storage Layer (Works offline on all mobile browsers & Native WebViews) ---

export interface LocalDatabaseState {
  users: User[];
  owners: Owner[];
  lands: Land[];
  waterSources: WaterSource[];
  visits: Visit[];
  labAnalyses: LabAnalysis[];
  tasks: Task[];
  messages: Message[];
  lookups: LookupItem[];
}

export function getLocalCachedData(): LocalDatabaseState | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'full_db');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading offline storage:', e);
  }
  return null;
}

export function saveLocalCachedData(data: Partial<LocalDatabaseState>): void {
  try {
    const existing = getLocalCachedData() || {
      users: [],
      owners: [],
      lands: [],
      waterSources: [],
      visits: [],
      labAnalyses: [],
      tasks: [],
      messages: [],
      lookups: defaultLookupItems
    };

    const updated = {
      ...existing,
      ...data,
      lastSaved: Date.now()
    };

    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'full_db', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write to offline storage cache:', e);
  }
}

// --- Offline Queue / Outbox Management ---

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function enqueueOfflineAction(
  table: string, 
  action: 'insert' | 'update' | 'delete', 
  recordId: string, 
  data: any
): OfflineQueueItem[] {
  const queue = getOfflineQueue();
  const newItem: OfflineQueueItem = {
    id: 'queue_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    table,
    action,
    recordId,
    data,
    timestamp: Date.now(),
    retries: 0
  };

  // Replace existing queue item for the same record if pending update
  const filtered = queue.filter(item => !(item.table === table && item.recordId === recordId && action === 'update'));
  const updatedQueue = [...filtered, newItem];
  
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
  return updatedQueue;
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}

export function removeQueueItems(successfulIds: string[]): OfflineQueueItem[] {
  const queue = getOfflineQueue();
  const remaining = queue.filter(item => !successfulIds.includes(item.id));
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
  return remaining;
}

// --- Sync Engine: Push Offline Changes & Pull Fresh Data ---

export interface SyncResult {
  success: boolean;
  pushedCount: number;
  pulledCount: number;
  serverTime?: string;
  error?: string;
}

export async function performFullSync(
  apiUrl: string = '/api',
  onDataMerged?: (merged: LocalDatabaseState) => void
): Promise<SyncResult> {
  const isOnline = await testServerConnection(apiUrl);
  if (!isOnline) {
    return {
      success: false,
      pushedCount: 0,
      pulledCount: 0,
      error: 'دستگاه در حالت آفلاین قرار دارد یا ارتباط با سرور برقرار نیست.'
    };
  }

  const queue = getOfflineQueue();
  let pushedCount = 0;

  // 1. PUSH local offline changes if any exist in outbox queue
  if (queue.length > 0) {
    try {
      const pushPayload: SyncPushPayload = {
        deviceId: getDeviceId(),
        clientTime: new Date().toISOString(),
        queue: queue
      };

      const pushRes = await fetch(`${apiUrl}/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushPayload)
      });

      if (pushRes.ok) {
        const pushData = await pushRes.json();
        const appliedIds = pushData.appliedIds || queue.map(q => q.id);
        removeQueueItems(appliedIds);
        pushedCount = appliedIds.length;
      }
    } catch (e: any) {
      console.warn('Sync push error, continuing with pull:', e);
    }
  }

  // 2. PULL latest updates from server
  try {
    const pullRes = await fetch(`${apiUrl}/data`, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (pullRes.ok) {
      const serverData = await pullRes.json();
      
      const merged: LocalDatabaseState = {
        users: serverData.users || [],
        owners: serverData.owners || serverData.farmers || [],
        lands: serverData.lands || [],
        waterSources: serverData.waterSources || serverData.water_sources || [],
        visits: serverData.visits || [],
        labAnalyses: serverData.labAnalyses || serverData.lab_analyses || [],
        tasks: serverData.tasks || [],
        messages: serverData.messages || [],
        lookups: serverData.lookups || defaultLookupItems
      };

      // Save to local cache for instant offline boot next time
      saveLocalCachedData(merged);
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      if (onDataMerged) {
        onDataMerged(merged);
      }

      return {
        success: true,
        pushedCount,
        pulledCount: (merged.lands.length + merged.visits.length + merged.tasks.length),
        serverTime: new Date().toLocaleTimeString('fa-IR')
      };
    }
  } catch (e: any) {
    return {
      success: false,
      pushedCount,
      pulledCount: 0,
      error: 'خطا در دریافت اطلاعات جدید از سرور: ' + (e.message || '')
    };
  }

  return {
    success: false,
    pushedCount,
    pulledCount: 0,
    error: 'پاسخ نامعتبر از سرور.'
  };
}

export function getLastSyncTimeFormatted(): string {
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  if (!raw) return 'همگام‌سازی نشده';
  try {
    const d = new Date(raw);
    return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('fa-IR');
  } catch (e) {
    return 'به‌تازگی';
  }
}
