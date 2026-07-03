export type DrmProvider = 'widevine' | 'playready' | 'fairplay' | 'clearkey' | 'none'

export interface DrmConfig {
  provider: DrmProvider
  licenseUrl: string
  certificateUrl?: string
  headers?: Record<string, string>
}

export interface DrmSession {
  mediaKeySystemAccess: MediaKeySystemAccess | null
  mediaKeys: MediaKeys | null
  keySession: MediaKeySession | null
}

const DRM_CONFIG_KEY = 'skillplace-drm-config'

export function getDrmConfig(): DrmConfig | null {
  try {
    const raw = sessionStorage.getItem(DRM_CONFIG_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DrmConfig
  } catch {
    return null
  }
}

export function setDrmConfig(config: DrmConfig) {
  sessionStorage.setItem(DRM_CONFIG_KEY, JSON.stringify(config))
}

export function clearDrmConfig() {
  sessionStorage.removeItem(DRM_CONFIG_KEY)
}

const DRM_SYSTEMS: Record<DrmProvider, string> = {
  widevine: 'com.widevine.alpha',
  playready: 'com.microsoft.playready',
  fairplay: 'com.apple.fps',
  clearkey: 'org.w3.clearkey',
  none: '',
}

export function getSupportedDrm(): DrmProvider[] {
  const supported: DrmProvider[] = []
  if (typeof window === 'undefined' || !window.navigator?.requestMediaKeySystemAccess) {
    return ['none']
  }
  const providers: DrmProvider[] = ['widevine', 'playready', 'fairplay', 'clearkey']
  return providers.filter(p => {
    try {
      return MediaKeySystemAccess !== undefined
    } catch {
      return false
    }
  })
}

export async function createDrmSession(
  video: HTMLVideoElement,
  config: DrmConfig,
  initData?: ArrayBuffer,
  initDataType?: string,
): Promise<DrmSession> {
  const keySystem = DRM_SYSTEMS[config.provider]
  if (!keySystem) {
    return { mediaKeySystemAccess: null, mediaKeys: null, keySession: null }
  }

  try {
    const mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(keySystem, [
      {
        initDataTypes: ['cenc', 'sinf', 'keyids', initDataType || 'cenc'].filter(Boolean),
        audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
        videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
      },
    ])

    const mediaKeys = await mediaKeySystemAccess.createMediaKeys()

    await video.setMediaKeys(null)
    await video.setMediaKeys(mediaKeys)

    const keySession = mediaKeys.createSession()
    keySession.addEventListener('message', async (event: MediaKeyMessageEvent) => {
      try {
        const response = await fetch(config.licenseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
          body: JSON.stringify({
            kid: event.message,
            sessionId: keySession.sessionId,
          }),
        })

        if (!response.ok) {
          throw new Error(`License server returned ${response.status}`)
        }

        const license = await response.arrayBuffer()
        await keySession.update(license)
      } catch {}
    })

    if (config.provider === 'fairplay' && config.certificateUrl) {
      try {
        const certRes = await fetch(config.certificateUrl)
        const cert = await certRes.arrayBuffer()
        await mediaKeys.setServerCertificate(cert)
      } catch {}
    }

    if (initData) {
      await keySession.generateRequest(initDataType || 'cenc', initData)
    }

    return { mediaKeySystemAccess, mediaKeys, keySession }
  } catch {
    return { mediaKeySystemAccess: null, mediaKeys: null, keySession: null }
  }
}

export async function destroyDrmSession(session: DrmSession): Promise<void> {
  try {
    if (session.keySession) {
      session.keySession.remove()
      session.keySession.close()
    }
    if (session.mediaKeys) {
      session.mediaKeys.setServerCertificate(new ArrayBuffer(0)).catch(() => {})
    }
  } catch {}
}

export function isDrmSupported(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.navigator?.requestMediaKeySystemAccess === 'function'
}
