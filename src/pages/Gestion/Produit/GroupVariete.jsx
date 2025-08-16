import { Edit, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react";
import API from "../../../utils/Api";
import Modal from "../../../components/ui/Modal";

// Hook de debounce personnalisé
const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState(null);

  return useCallback((...args) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => callback(...args), delay);
    setDebounceTimer(timer);
  }, [callback, delay, debounceTimer]);
};

function GroupVariete() {
  const [groupVarietes, setGroupVarietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedGroupVariete, setSelectedGroupVariete] = useState(null);
  const [formData, setFormData] = useState({ codgrv: '', nomgrv: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedGroupVarietes, setPaginatedGroupVarietes] = useState([]);

  // Récupérer les données
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/GroupVarietes");

      if (res.data) {
        const dataArray = Array.isArray(res.data) ? res.data : [res.data];
        // Filtrer les éléments invalides
        const validGroupVarietes = dataArray.filter(groupe =>
          groupe && typeof groupe === 'object' && groupe.codgrv
        );
        setGroupVarietes(validGroupVarietes);
      } else {
        setGroupVarietes([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes variété:', error);

      let errorMessage = 'Échec de la récupération des données';

      if (error.response) {
        errorMessage = error.response.data?.message ||
          `Erreur serveur (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'Problème de connexion. Vérifiez votre réseau.';
      }

      setError({
        message: errorMessage,
        status: error.response?.status,
        isNetworkError: !error.response
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Vérifier si le code de groupe variété existe
  const checkCodeExists = async (code) => {
    if (!code || modalMode !== 'create') return;

    // Vérifier d'abord localement
    const existsLocally = groupVarietes.some(groupe =>
      groupe.codgrv.toString().toLowerCase() === code.toString().toLowerCase()
    );

    if (existsLocally) {
      setFormErrors(prev => ({
        ...prev,
        codgrv: 'Ce code existe déjà. Veuillez utiliser un code différent.'
      }));
      return;
    }

    // Si pas trouvé localement, vérifier sur le serveur
    try {
      setCheckingCode(true);
      const res = await API.get(`/GroupVarietes/${code}`);

      if (res.data) {
        setFormErrors(prev => ({
          ...prev,
          codgrv: 'Ce code existe déjà. Veuillez utiliser un code différent.'
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.codgrv;
          return newErrors;
        });
      } else {
        console.warn('Erreur lors de la vérification de la disponibilité du code:', error);
      }
    } finally {
      setCheckingCode(false);
    }
  };

  // Debounce pour la vérification du code
  const debouncedCheckCode = useDebounce(checkCodeExists, 500);

  // Gestionnaires de modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ codgrv: '', nomgrv: '' });
    setFormErrors({});
    setSelectedGroupVariete(null);
    setIsModalOpen(true);
  };

  const openEditModal = (groupVariete) => {
    setModalMode('edit');
    setFormData({ codgrv: groupVariete.codgrv, nomgrv: groupVariete.nomgrv });
    setFormErrors({});
    setSelectedGroupVariete(groupVariete);
    setIsModalOpen(true);
  };

  const openDeleteModal = (groupVariete) => {
    setModalMode('delete');
    setSelectedGroupVariete(groupVariete);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('create');
    setSelectedGroupVariete(null);
    setFormData({ codgrv: '', nomgrv: '' });
    setFormErrors({});
    setSubmitting(false);
    setCheckingCode(false);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    // Sécuriser la valeur
    const codgrv = String(formData.codgrv);
    console.log(codgrv);
    // Validation du code
    if (!codgrv.trim()) {
      errors.codgrv = 'Le code est requis';
    } else if (codgrv.length < 2) {
      errors.codgrv = 'Le code doit contenir au moins 2 caractères';
    } else if (!/^[A-Za-z0-9_-]+$/.test(codgrv.trim())) {
      errors.codgrv = 'Le code ne peut contenir que des lettres, chiffres, tirets et underscores';
    }

    // Validation du nom
    if (!formData.nomgrv?.trim()) {
      errors.nomgrv = 'Le nom est requis';
    } else if (formData.nomgrv.trim().length < 2) {
      errors.nomgrv = 'Le nom doit contenir au moins 2 caractères';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Opérations CRUD
  const handleCreate = async () => {
    if (!validateForm()) return;

    if (formErrors.codgrv) return;

    try {
      setSubmitting(true);
      const res = await API.post("/GroupVarietes", formData);

      setGroupVarietes(prev => [...prev, res.data]);
      closeModal();

      console.log('Groupe variété créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du groupe variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la création du groupe variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await API.put(`/GroupVarietes/${selectedGroupVariete.codgrv}`, formData);

      // Mise à jour optimiste locale
      setGroupVarietes(prev =>
        prev.map(groupe =>
          groupe.codgrv === selectedGroupVariete.codgrv
            ? { ...groupe, ...formData }
            : groupe
        )
      );

      closeModal();
      //console.log('Groupe variété mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du groupe variété:', error);
      // En cas d'erreur, recharger les données
      fetchData();
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la mise à jour du groupe variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await API.delete(`/GroupVarietes/${selectedGroupVariete.codgrv}`);

      setGroupVarietes(prev =>
        prev.filter(groupe => groupe.codgrv !== selectedGroupVariete.codgrv)
      );
      closeModal();

      console.log('Groupe variété supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la suppression du groupe variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Gestionnaire d'entrée de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Vérification en temps réel pour le code (avec debounce)
    if (name === 'codgrv' && modalMode === 'create' && value.trim()) {
      debouncedCheckCode(value.trim());
    }
  };

  // Gérer le blur de l'entrée de code
  const handleCodeBlur = () => {
    if (formData.codgrv && modalMode === 'create') {
      checkCodeExists(formData.codgrv);
    }
  };

  // Pagination Functions
  useEffect(() => {
    // Calculate pagination whenever groupVarietes changes
    const total = Math.ceil(groupVarietes.length / itemsPerPage);
    setTotalPages(total);

    // Reset to page 1 if current page is beyond total pages
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [groupVarietes, itemsPerPage, currentPage]);

  // handle paginated data
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedGroupVarietes(groupVarietes.slice(startIndex, endIndex));
  }, [groupVarietes, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
              <h3 className="text-lg font-semibold text-gray-900">Supprimer le Groupe Variété</h3>
              <p className="text-sm text-gray-600">Cette action ne peut pas être annulée.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer le groupe variété "{selectedGroupVariete?.nomgrv}"
              avec le code "{selectedGroupVariete?.codgrv}" ?
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
      <div className="p-6">
        <div className="my-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalMode === 'create' ? 'Créer un Nouveau Groupe Variété' : 'Modifier le Groupe Variété'}
          </h3>
          <p className="text-sm text-gray-600">
            {modalMode === 'create'
              ? 'Remplissez les détails pour créer un nouveau groupe variété.'
              : 'Mettre à jour les informations du groupe variété.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="codgrv" className="block text-sm font-medium text-gray-700 mb-1">
              Code *
            </label>
            <div className="relative">
              <input
                type="text"
                id="codgrv"
                name="codgrv"
                value={formData.codgrv}
                onChange={handleInputChange}
                onBlur={handleCodeBlur}
                disabled={modalMode === "edit"}
                aria-describedby={formErrors.codgrv ? "codgrv-error" : undefined}
                aria-invalid={!!formErrors.codgrv}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.codgrv ? 'border-red-300' : 'border-gray-300'
                  } ${checkingCode ? 'pr-10' : ''}`}
                placeholder="Entrez le code du groupe variété"
              />
              {checkingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {formErrors.codgrv && (
              <p id="codgrv-error" className="mt-1 text-sm text-red-600" role="alert">
                {formErrors.codgrv}
              </p>
            )}
            {checkingCode && (
              <p className="mt-1 text-sm text-gray-500">Vérification de la disponibilité du code...</p>
            )}
          </div>

          <div>
            <label htmlFor="nomgrv" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              id="nomgrv"
              name="nomgrv"
              value={formData.nomgrv}
              onChange={handleInputChange}
              aria-describedby={formErrors.nomgrv ? "nomgrv-error" : undefined}
              aria-invalid={!!formErrors.nomgrv}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.nomgrv ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Entrez le nom du groupe variété"
            />
            {formErrors.nomgrv && (
              <p id="nomgrv-error" className="mt-1 text-sm text-red-600" role="alert">
                {formErrors.nomgrv}
              </p>
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
            disabled={submitting || checkingCode || (modalMode === 'create' && formErrors.codgrv)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {modalMode === 'create' ? 'Créer' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      {/* En-tête avec bouton Ajouter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Groupes Variété</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos groupes de variétés</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="sm:inline">Ajouter un Groupe Variété</span>
        </button>
      </div>

      {/* État d'erreur */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des groupes variété</h3>
            <p className="text-sm text-red-700 mt-1 break-words">{error.message}</p>
            {error.status && (
              <p className="text-xs text-red-600 mt-1">Statut: {error.status}</p>
            )}
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span className="text-gray-600">Chargement des groupes variété...</span>
          </div>
        </div>
      )}

      {/* Tableau */}
      {!loading && !error && (
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
                    Nom
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedGroupVarietes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <p>Aucun groupe variété trouvé</p>
                        <button
                          onClick={openCreateModal}
                          className="text-primary-600 hover:text-primary-700 text-sm underline"
                        >
                          Créer votre premier groupe variété
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedGroupVarietes.map((groupVariete, index) => (
                    <tr key={groupVariete.codgrv || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {groupVariete.codgrv}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {groupVariete.nomgrv}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(groupVariete)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Modifier le groupe variété"
                          >
                            <Edit size={16} className="text-primary-600" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(groupVariete)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Supprimer le groupe variété"
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
            {paginatedGroupVarietes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <p>Aucun groupe variété trouvé</p>
                  <button
                    onClick={openCreateModal}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Créer votre premier groupe variété
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedGroupVarietes.map((groupVariete, index) => (
                  <div key={groupVariete.codgrv || index} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Code:</span>
                            <span className="text-sm font-medium text-gray-900 truncate">{groupVariete.codgrv}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Nom:</span>
                            <span className="text-sm text-gray-600 truncate">{groupVariete.nomgrv}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openEditModal(groupVariete)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                          title="Modifier le groupe variété"
                        >
                          <Edit size={18} className="text-primary-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(groupVariete)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                          title="Supprimer le groupe variété"
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
      )}

      {/* Pagination */}
      {!loading && !error && groupVarietes.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="sm:text-sm text-xs text-gray-700">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, groupVarietes.length)} sur {groupVarietes.length} résultats
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Précédent</span>
              <span className="sm:hidden">Préc</span>
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;

                // Mobile: Show fewer pages (current + 1 adjacent)
                // Desktop: Show more pages (current + 2 adjacent)
                const isMobile = window.innerWidth < 640; // sm breakpoint
                const adjacentPages = isMobile ? 1 : 2;

                // Always show first page, last page, current page and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - adjacentPages && page <= currentPage + adjacentPages)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg ${isCurrentPage
                        ? 'text-white bg-primary-600 border border-primary-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                }

                // Show ellipsis for gaps
                if (
                  (page === currentPage - adjacentPages - 1 && page > 1) ||
                  (page === currentPage + adjacentPages + 1 && page < totalPages)
                ) {
                  return (
                    <span key={page} className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500">
                      ...
                    </span>
                  );
                }

                return null;
              })}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Suivant</span>
              <span className="sm:hidden">Suiv</span>
            </button>
          </div>
        </div>
      )}

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

export default GroupVariete;
