import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import API from "../../../../utils/Api";
import Modal from "../../../../components/ui/Modal";

function PorteGreffe() {
  const [porteGreffes, setPorteGreffes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPorteGreffe, setSelectedPorteGreffe] = useState(null);
  const [formData, setFormData] = useState({ code: '', libelle: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  // Charger les données depuis l'API
  const fetchPorteGreffes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/PorteGreefs");

      if (res.data && Array.isArray(res.data)) {
        setPorteGreffes(res.data);
      } else {
        setPorteGreffes(res.data ? [res.data] : []);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des porte-greffes:', err);
      setError({
        message: err.response?.data?.message || err.message || 'Échec de la récupération des données',
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  console.log(porteGreffes)

  // Charger les données au montage du composant
  useEffect(() => {
    fetchPorteGreffes();
  }, []);

  // Filtrer les porte-greffes selon le terme de recherche
  const filteredPorteGreffes = porteGreffes.filter(pg =>
    pg.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pg.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier si le code de porte-greffe existe
  const checkCodeExists = async (code) => {
    if (!code || modalMode !== 'create') return;

    // Vérifier d'abord localement
    const existsLocally = porteGreffes.some(pg =>
      pg.code.toString().toLowerCase() === code.toString().toLowerCase()
    );

    if (existsLocally) {
      setFormErrors(prev => ({
        ...prev,
        code: 'Ce code existe déjà. Veuillez utiliser un code différent.'
      }));
      return;
    }

    try {
      setCheckingCode(true);
      const res = await API.get(`/PorteGreefs/${code}`);

      // Si nous obtenons une réponse sans erreur, le code existe
      if (res.data) {
        setFormErrors(prev => ({
          ...prev,
          code: 'Ce code existe déjà. Veuillez utiliser un code différent.'
        }));
      }
    } catch (error) {
      // Si nous obtenons une erreur 404 ou similaire, le code n'existe pas (ce qui est bien)
      if (error.response?.status === 404) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.code;
          return newErrors;
        });
      } else {
        // Pour les autres erreurs, nous pourrions vouloir afficher un avertissement mais ne pas bloquer le formulaire
        console.warn('Erreur lors de la vérification de la disponibilité du code:', error);
      }
    } finally {
      setCheckingCode(false);
    }
  };

  // Gestionnaires de modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ code: '', libelle: '' });
    setFormErrors({});
    setSelectedPorteGreffe(null);
    setIsModalOpen(true);
  };

  const openEditModal = (porteGreffe) => {
    setModalMode('edit');
    setFormData({ code: porteGreffe.code, libelle: porteGreffe.libelle });
    setFormErrors({});
    setSelectedPorteGreffe(porteGreffe);
    setIsModalOpen(true);
  };

  const openDeleteModal = (porteGreffe) => {
    setModalMode('delete');
    setSelectedPorteGreffe(porteGreffe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('create');
    setSelectedPorteGreffe(null);
    setFormData({ code: '', libelle: '' });
    setFormErrors({});
    setSubmitting(false);
    setCheckingCode(false);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.code?.trim()) {
      errors.code = 'Le code est requis';
    }

    if (!formData.libelle?.trim()) {
      errors.libelle = 'Le libellé est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ajouter un nouveau porte-greffe
  const handleCreate = async () => {
    if (!validateForm()) return;

    // Ne pas soumettre s'il y a des erreurs de validation existantes (comme un code dupliqué)
    if (formErrors.code) return;

    try {
      setSubmitting(true);
      const res = await API.post("/PorteGreefs", {
        code: formData.code.trim(),
        libelle: formData.libelle.trim()
      });

      // Ajouter le nouveau porte-greffe à la liste
      setPorteGreffes(prev => [...prev, res.data]);
      closeModal();

      console.log('Porte-greffe créé avec succès');
    } catch (err) {
      console.error('Erreur lors de la création du porte-greffe:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Échec de la création du porte-greffe'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Sauvegarder les modifications
  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await API.put(`/PorteGreefs/${selectedPorteGreffe.code}`, {
        code: formData.code.trim(),
        libelle: formData.libelle.trim()
      });

      // Mettre à jour le porte-greffe dans la liste
      setPorteGreffes(prev =>
        prev.map(pg =>
          pg.code === selectedPorteGreffe.code
            ? { ...pg, ...formData }
            : pg
        )
      );
      closeModal();

      console.log('Porte-greffe mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du porte-greffe:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Échec de la mise à jour du porte-greffe'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un porte-greffe
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await API.delete(`/PorteGreefs/${selectedPorteGreffe.code}`);

      // Retirer le porte-greffe de la liste
      setPorteGreffes(prev =>
        prev.filter(pg => pg.code !== selectedPorteGreffe.code)
      );
      closeModal();

      console.log('Porte-greffe supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du porte-greffe:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Échec de la suppression du porte-greffe'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Gestionnaire d'entrée de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Effacer l'erreur de champ quand l'utilisateur commence à taper
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Gérer le blur de l'entrée de code (quand l'utilisateur quitte le champ d'entrée)
  const handleCodeBlur = () => {
    if (formData.code && modalMode === 'create') {
      checkCodeExists(formData.code);
    }
  };

  // Rendre le contenu du modal selon le mode
  const renderModalContent = () => {
    if (modalMode === 'delete') {
      return (
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Supprimer le Porte-Greffe</h3>
              <p className="text-sm text-gray-600">Cette action ne peut pas être annulée.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer le porte-greffe "{selectedPorteGreffe?.libelle}"
              avec le code "{selectedPorteGreffe?.code}" ?
            </p>
          </div>

          {formErrors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{formErrors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Supprimer
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 mt-7">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalMode === 'create' ? 'Créer un Nouveau Porte-Greffe' : 'Modifier le Porte-Greffe'}
          </h3>
          <p className="text-sm text-gray-600">
            {modalMode === 'create'
              ? 'Remplissez les détails pour créer un nouveau porte-greffe.'
              : 'Mettre à jour les informations du porte-greffe.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code *
            </label>
            <div className="relative">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                onBlur={handleCodeBlur}
                disabled={modalMode === "edit"}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.code ? 'border-red-300' : 'border-gray-300'
                  } ${checkingCode ? 'pr-10' : ''}`}
                placeholder="Ex: PG001"
              />
              {checkingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {formErrors.code && (
              <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
            )}
            {checkingCode && (
              <p className="mt-1 text-sm text-gray-500">Vérification de la disponibilité du code...</p>
            )}
          </div>

          <div>
            <label htmlFor="libelle" className="block text-sm font-medium text-gray-700 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              id="libelle"
              name="libelle"
              value={formData.libelle}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.libelle ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Ex: Porte-greffe citrus volkameriana"
            />
            {formErrors.libelle && (
              <p className="mt-1 text-sm text-red-600">{formErrors.libelle}</p>
            )}
          </div>
        </div>

        {formErrors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{formErrors.submit}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={modalMode === 'create' ? handleCreate : handleUpdate}
            disabled={submitting || checkingCode || (modalMode === 'create' && formErrors.code)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {modalMode === 'create' ? 'Créer' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    );
  };

  // Affichage du loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span className="text-gray-600">Chargement des porte-greffes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des porte-greffes</h3>
            <p className="text-sm text-red-700 mt-1 break-words">{error.message}</p>
            {error.status && (
              <p className="text-xs text-red-600 mt-1">Statut: {error.status}</p>
            )}
            <button
              onClick={fetchPorteGreffes}
              className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Porte-Greffes</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos porte-greffes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="sm:inline">Ajouter un Porte-Greffe</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par code ou libellé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Version desktop - tableau traditionnel */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libellé
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPorteGreffes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>
                        {searchTerm ? 'Aucun porte-greffe trouvé pour cette recherche.' : 'Aucun porte-greffe trouvé'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={openCreateModal}
                          className="text-primary-600 hover:text-primary-700 text-sm underline"
                        >
                          Créer votre premier porte-greffe
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPorteGreffes.map((porteGreffe, index) => (
                  <tr key={porteGreffe.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{porteGreffe.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{porteGreffe.libelle}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(porteGreffe)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Modifier le porte-greffe"
                        >
                          <Edit2 size={16} className="text-primary-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(porteGreffe)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Supprimer le porte-greffe"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Version mobile - cartes */}
        <div className="sm:hidden">
          {filteredPorteGreffes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <p>
                  {searchTerm ? 'Aucun porte-greffe trouvé pour cette recherche.' : 'Aucun porte-greffe trouvé'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openCreateModal}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Créer votre premier porte-greffe
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPorteGreffes.map((porteGreffe, index) => (
                <div key={porteGreffe.id || index} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 uppercase font-medium">Code:</span>
                          <span className="text-sm font-medium text-gray-900 truncate">{porteGreffe.code}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 uppercase font-medium mt-0.5">Libellé:</span>
                          <span className="text-sm text-gray-600 break-words">{porteGreffe.libelle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => openEditModal(porteGreffe)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                        title="Modifier le porte-greffe"
                      >
                        <Edit2 size={18} className="text-primary-600" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(porteGreffe)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-600">
        Total: {filteredPorteGreffes.length} porte-greffe(s)
        {searchTerm && ` (${porteGreffes.length} au total)`}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="max-w-md mx-4 sm:mx-auto"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default PorteGreffe;