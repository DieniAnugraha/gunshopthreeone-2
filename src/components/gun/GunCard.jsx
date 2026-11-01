import { Share2 } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { formatPrice, truncate } from '../../utils/helpers'

export default function GunCard({ gun, onSelect, onEdit, onDelete }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  const handleShare = (e) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}?gun=${gun.id || encodeURIComponent(gun.name)}`
    navigator.clipboard.writeText(shareUrl)
    alert(`Tautan unik berhasil disalin: ${shareUrl}`)
  }

  return (
    <li className="card">
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={`View ${gun.name}`}
      >
        <img
          className="card-img"
          src={imgSrc}
          alt={gun.name}
          width="240"
          height="180"
          loading="lazy"
        />
        <span className="name display">{gun.name}</span>
        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
        </span>
        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}
        <span className="price">{formatPrice(price)}</span>
      </button>

      <div className="card-actions">
        <button
          type="button"
          className="card-act-btn"
          onClick={handleShare}
          title="Bagikan Tautan Unik"
          aria-label="Share"
        >
          <Share2 size={14} />
        </button>
        <FavoriteButton gunId={gun.id || gun.name} />
        {onEdit && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(gun) }}
            title="Edit"
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="card-act-btn card-act-btn--danger"
            onClick={(e) => { e.stopPropagation(); onDelete(gun) }}
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    </li>
  )
}
