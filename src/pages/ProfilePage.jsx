import { useState } from 'react'
import { Shield, Copy, Check, Save, Heart, FileText, Camera, Play, Info, MapPin } from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import { getAllDraftIds, deleteDraft } from '../utils/draftStorage'

export default function ProfilePage({ onReplaySplash }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Shooter')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { favorites } = useFavorites()
  const [drafts, setDrafts] = useState(() => getAllDraftIds())

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setAvatar(base64)
      userService.updateAvatar(base64)
      setFeedback('Avatar updated.')
      setTimeout(() => setFeedback(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const updated = { ...profile, username: username.trim(), bio: bio.trim(), avatar }
    const result = userService.saveUserProfile(updated)
    if (result.success) {
      setProfile(result.data)
      setFeedback('Profile successfully updated.')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const handleDeleteDraft = (id) => {
    deleteDraft(id)
    setDrafts(getAllDraftIds())
    setFeedback(`Draft ${id} dihapus.`)
    setTimeout(() => setFeedback(''), 3000)
  }

  return (
    <div className="profile-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section className="masthead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">Operator credentials, procurement statistics, and armorer details.</p>
        </div>
        {onReplaySplash && (
          <button type="button" className="btn btn--outline btn--sm" onClick={onReplaySplash}>
            <Play size={14} /> Replay Intro
          </button>
        )}
      </section>

      {feedback && (
        <div className="toast toast--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
            <label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Upload avatar">
              <Camera size={14} />
              <input id="avatar-file-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden-file-input" />
            </label>
          </div>
          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button type="button" className="icon-btn" onClick={handleCopyId} title="Copy User ID">
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Procurement Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{drafts.length}</div>
            <div className="stat-label">Saved Offline Drafts</div>
          </div>
        </div>
      </div>

      <div className="card-box">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileText size={18} /> Draft Catalog List ({drafts.length})
        </h3>
        {drafts.length === 0 ? (
          <p className="lede" style={{ fontSize: '0.9rem' }}>Tidak ada draf katalog yang tersimpan.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {drafts.map((dId) => (
              <li key={dId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--paper)', borderRadius: '4px', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Draft ID: <code>{dId}</code></span>
                <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => handleDeleteDraft(dId)}>Hapus</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="card-box" style={{ margin: 0 }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Info size={18} /> About Armory
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--steel)', lineHeight: 1.5, margin: 0 }}>
            Bore &amp; Barrel (Gunshop Asli Ngawi) menyediakan katalog perangkat senjata api standar militer dan komersial dengan spesifikasi transparan.
          </p>
        </div>
        <div className="card-box" style={{ margin: 0 }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <MapPin size={18} /> Contact Station
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--steel)', lineHeight: 1.5, margin: 0 }}>
            Lokasi: 123 Range Road, Ngawi / Semarang.<br />
            Kontak: (555) 010-0100<br />
            Jam Operasional: Selasa – Sabtu (10:00 - 18:00)
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="profile-form">
        <h3 className="section-title">Edit Operator Profile</h3>
        <div className="form-group">
          <label htmlFor="prof-name" className="form-label">Callsign / Operator Alias</label>
          <input id="prof-name" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="prof-bio" className="form-label">Armory Notes / Station Bio</label>
          <textarea id="prof-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="form-textarea" />
        </div>
        <button type="submit" className="btn btn--primary">
          <Save size={16} /> Save Changes
        </button>
      </form>
    </div>
  )
}
