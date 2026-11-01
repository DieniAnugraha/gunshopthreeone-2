import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import gunService from '../services/gunService'
import { matchesSearch, matchesCategory, sortItems, extractCategories } from '../utils/helpers'

export default function Catalog({ onNavigate }) {
  const [page, setPage] = useState(1)
  const limit = 8
  const { guns: apiGuns, loading, error, refetch } = useGuns({ limit: 50, page })
  const [useLocal, setUseLocal] = useState(false)

  const rawGuns = useMemo(() => {
    if (useLocal || (error && apiGuns.length === 0)) {
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))
    }
    return apiGuns
  }, [apiGuns, error, useLocal])

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter(
      (g) => matchesSearch(g, search) && matchesCategory(g, activeCategory),
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder])

  const paginatedGuns = useMemo(() => {
    const start = (page - 1) * limit
    return filteredGuns.slice(start, start + limit)
  }, [filteredGuns, page, limit])

  const totalPages = Math.ceil(filteredGuns.length / limit) || 1

  const [selectedGun, setSelectedGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      await gunService.deleteGun(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete.')
    } finally {
      setDeleting(false)
    }
  }

  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => setSelectedGun(null)}
        onEdit={(g) => onNavigate && onNavigate('Edit', g)}
        onDelete={(g) => { setSelectedGun(null); setDeleteTarget(g) }}
      />
    )
  }

  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Paginasi &amp; optimal caching aktif.
        </p>
      </section>
      <section>
        <div className="list-head">
          <h2>Current stock</h2>
          <div className="list-head-right">
            <span className="count">{filteredGuns.length} pieces found</span>
            {onNavigate && (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onNavigate('Create')}>
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        <AdvancedFilter
          search={search}
          onSearch={(val) => { setSearch(val); setPage(1); }}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={(cat) => { setActiveCategory(cat); setPage(1); }}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={({ key, order }) => { setSortKey(key); setSortOrder(order) }}
        />

        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products…</p>
          </div>
        )}

        {!loading && paginatedGuns.length === 0 && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>No products match your search.</p>
          </div>
        )}

        {paginatedGuns.length > 0 && (
          <>
            <ul className="stock">
              {paginatedGuns.map((gun) => (
                <GunCard
                  key={gun.id || gun.name}
                  gun={gun}
                  onSelect={setSelectedGun}
                  onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                  onDelete={setDeleteTarget}
                />
              ))}
            </ul>

            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="count" style={{ fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError('') }}
      />
    </>
  )
}
