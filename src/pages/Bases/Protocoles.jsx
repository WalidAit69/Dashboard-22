import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X, Loader } from 'lucide-react';

function Protocole() {
  const [protocoles, setProtocoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newProtocole, setNewProtocole] = useState({ libelle: '' });
  const [editData, setEditData] = useState({ libelle: '' });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = 'http://196.206.227.23/api/Protocoles';

  // Charger les données depuis l'API
  const fetchProtocoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setProtocoles(data);
    } catch (err) {
      setError(`Erreur lors du chargement: ${err.message}`);
      console.error('Erreur fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchProtocoles();
  }, []);

  // Filtrer les protocoles selon le terme de recherche
  const filteredProtocoles = protocoles.filter(protocole =>
    protocole.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter un nouveau protocole
  const handleAddProtocole = async () => {
    if (!newProtocole.libelle.trim()) {
      alert('Veuillez remplir le libellé');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          libelle: newProtocole.libelle.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Recharger les données après ajout
      await fetchProtocoles();
      setNewProtocole({ libelle: '' });
      setIsAddingNew(false);
    } catch (err) {
      setError(`Erreur lors de l'ajout: ${err.message}`);
      console.error('Erreur ajout:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Commencer l'édition
  const handleEdit = (protocole) => {
    setEditingId(protocole.id);
    setEditData({ libelle: protocole.libelle });
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!editData.libelle.trim()) {
      alert('Veuillez remplir le libellé');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          libelle: editData.libelle.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Recharger les données après modification
      await fetchProtocoles();
      setEditingId(null);
      setEditData({ libelle: '' });
    } catch (err) {
      setError(`Erreur lors de la modification: ${err.message}`);
      console.error('Erreur modification:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ libelle: '' });
  };

  // Supprimer un protocole
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce protocole ?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Recharger les données après suppression
      await fetchProtocoles();
    } catch (err) {
      setError(`Erreur lors de la suppression: ${err.message}`);
      console.error('Erreur suppression:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Affichage du loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="ml-3 text-gray-600">Chargement des protocoles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchProtocoles}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
          Gestion des Protocoles
        </h2>
        <button
          onClick={() => setIsAddingNew(true)}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par libellé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nouveau Protocole</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
            <input
              type="text"
              value={newProtocole.libelle}
              onChange={(e) => setNewProtocole({ libelle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Ex: Protocole de traitement phytosanitaire"
              disabled={submitting}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddProtocole}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {submitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewProtocole({ libelle: '' });
              }}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <X size={16} />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libellé
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProtocoles.map((protocole) => (
                <tr key={protocole.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{protocole.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === protocole.id ? (
                      <input
                        type="text"
                        value={editData.libelle}
                        onChange={(e) => setEditData({ libelle: e.target.value })}
                        disabled={submitting}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-50"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{protocole.libelle}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === protocole.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={submitting}
                          className="text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Enregistrer"
                        >
                          {submitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={submitting}
                          className="text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Annuler"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(protocole)}
                          disabled={submitting}
                          className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(protocole.id)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProtocoles.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Aucun protocole trouvé pour cette recherche.' : 'Aucun protocole enregistré.'}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-600">
        Total: {filteredProtocoles.length} protocole(s)
        {searchTerm && ` (${protocoles.length} au total)`}
      </div>
    </div>
  );
}

export default Protocole;