import { Edit, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react";
import API from "../../utils/Api";
import { Modal } from "../../components/ui/Modal";

function SousVariete() {
  const [sousVarietes, setSousVarietes] = useState([]);
  const [varietes, setVarietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVarietes, setLoadingVarietes] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSousVariete, setSelectedSousVariete] = useState(null);
  const [formData, setFormData] = useState({ codsvar: '', nomsvar: '', codvar: '', variete: {} });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedSousVarietes, setPaginatedSousVarietes] = useState([]);

  // Récupérer les données
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/SousVarietes");

      if (res.data && Array.isArray(res.data)) {
        setSousVarietes(res.data);
      } else {
        setSousVarietes(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sous-variétés:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Échec de la récupération des données',
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVarietes = async () => {
    try {
      setLoadingVarietes(true);
      const res = await API.get("/Varietes");

      if (res.data && Array.isArray(res.data)) {
        setVarietes(res.data);
      } else {
        setVarietes(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des variétés:', error);
      // Handle error if needed
    } finally {
      setLoadingVarietes(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchVarietes();

  }, []);

  useEffect(() => {
    // Calculate pagination whenever sousVarietes changes
    const total = Math.ceil(sousVarietes.length / itemsPerPage);
    setTotalPages(total);

    // Reset to page 1 if current page is beyond total pages
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [sousVarietes, itemsPerPage, currentPage]);

  // handle paginated data
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedSousVarietes(sousVarietes.slice(startIndex, endIndex));
  }, [sousVarietes, currentPage, itemsPerPage]);

  const getVarietyName = (codvar) => {
    const variete = varietes.find(v => v.codvar === codvar);
    return variete ? `${variete.codvar} - ${variete.nomvar}` : codvar;
  };

  // Vérifier si le code de sous-variété existe
  const checkCodeExists = async (code) => {
    if (!code || modalMode !== 'create') return;

    const intCode = parseInt(code, 10);  // Convert to integer
    if (isNaN(intCode)) return;  // Skip if not a valid number

    // Check locally first
    const existsLocally = sousVarietes.some(sousVariete =>
      parseInt(sousVariete.codsvar, 10) === intCode  // Convert both to int for comparison
    );

    if (existsLocally) {
      setFormErrors(prev => ({
        ...prev,
        codsvar: 'Ce code existe déjà. Veuillez utiliser un code différent.'
      }));
      return;
    }

    try {
      setCheckingCode(true);
      const res = await API.get(`/SousVarietes/${intCode}`);  // Use integer value

      // If we get a response without error, the code exists
      if (res.data) {
        setFormErrors(prev => ({
          ...prev,
          codsvar: 'Ce code existe déjà. Veuillez utiliser un code différent.'
        }));
      }
    } catch (error) {
      // If we get a 404 or similar error, the code doesn't exist (which is good)
      if (error.response?.status === 404) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.codsvar;
          return newErrors;
        });
      } else {
        // For other errors, we might want to show a warning but not block the form
        console.warn('Erreur lors de la vérification de la disponibilité du code:', error);
      }
    } finally {
      setCheckingCode(false);
    }
  };

  // Gestionnaires de modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ codsvar: '', nomsvar: '', codvar: '', variete: {} });
    setFormErrors({});
    setSelectedSousVariete(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sousVariete) => {
    setModalMode('edit');
    setFormData({
      codsvar: parseInt(sousVariete.codsvar, 10),
      nomsvar: sousVariete.nomsvar,
      codvar: parseInt(sousVariete.codvar, 10),
      variete: sousVariete.variete
    });
    setFormErrors({});
    setSelectedSousVariete(sousVariete);
    setIsModalOpen(true);
  };

  const openDeleteModal = (sousVariete) => {
    setModalMode('delete');
    setSelectedSousVariete(sousVariete);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('create');
    setSelectedSousVariete(null);
    setFormData({ codsvar: '', nomsvar: '', codvar: '', variete: '' });
    setFormErrors({});
    setSubmitting(false);
    setCheckingCode(false);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.codsvar) {
      errors.codsvar = 'Le code est requis';
    } else if (isNaN(parseInt(formData.codsvar, 10))) {  // Check if it's a valid number
      errors.codsvar = 'Le code doit être un nombre valide';
    }

    if (!formData.nomsvar?.trim()) {
      errors.nomsvar = 'Le nom est requis';
    }

    if (!formData.codvar) {
      errors.codvar = 'Le code variété est requis';
    } else if (isNaN(parseInt(formData.codvar, 10))) {  // Check if it's a valid number
      errors.codvar = 'Le code variété doit être un nombre valide';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Opérations CRUD
  const handleCreate = async () => {
    if (!validateForm()) return;

    // Ne pas soumettre s'il y a des erreurs de validation existantes (comme un code dupliqué)
    if (formErrors.codsvar) return;

    try {
      setSubmitting(true);
      const res = await API.post("/SousVarietes", formData);

      // Ajouter la nouvelle sous-variété à la liste
      setSousVarietes(prev => [...prev, res.data]);
      closeModal();

      // Afficher un message de succès (vous pouvez implémenter une notification toast ici)
      console.log('Sous-variété créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la sous-variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la création de la sous-variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await API.put(`/SousVarietes/${selectedSousVariete.codsvar}`, formData);

      // Mettre à jour la sous-variété dans la liste
      setSousVarietes(prev =>
        prev.map(sousVariete =>
          sousVariete.codsvar === selectedSousVariete.codsvar
            ? { ...sousVariete, ...formData }
            : sousVariete
        )
      );
      closeModal();

      console.log('Sous-variété mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sous-variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la mise à jour de la sous-variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await API.delete(`/SousVarietes/${selectedSousVariete.codsvar}`);

      // Retirer la sous-variété de la liste
      setSousVarietes(prev =>
        prev.filter(sousVariete => sousVariete.codsvar !== selectedSousVariete.codsvar)
      );
      closeModal();

      console.log('Sous-variété supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la sous-variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la suppression de la sous-variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Gestionnaire d'entrée de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert codsvar and codvar to integers
    let processedValue = value;
    if (name === 'codsvar' || name === 'codvar') {
      processedValue = value === '' ? '' : parseInt(value, 10);
    }

    // If codvar is being changed, also update the variete field
    if (name === 'codvar') {
      const selectedVariete = varietes.find(v =>
        parseInt(v.codvar, 10) === parseInt(value, 10)  // Convert both to int for comparison
      );
      console.log('Selected value:', value);
      console.log('Varietes:', varietes);
      console.log('Selected variete:', selectedVariete);
      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
        variete: selectedVariete ? selectedVariete : {}
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Pagination handlers
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

  // Gérer le blur de l'entrée de code (quand l'utilisateur quitte le champ d'entrée)
  const handleCodeBlur = () => {
    if (formData.codsvar && modalMode === 'create') {
      checkCodeExists(formData.codsvar);
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
              <h3 className="text-lg font-semibold text-gray-900">Supprimer la Sous-Variété</h3>
              <p className="text-sm text-gray-600">Cette action ne peut pas être annulée.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer la sous-variété "{selectedSousVariete?.nomsvar}"
              avec le code "{selectedSousVariete?.codsvar}" ?
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
            {modalMode === 'create' ? 'Créer une Nouvelle Sous-Variété' : 'Modifier la Sous-Variété'}
          </h3>
          <p className="text-sm text-gray-600">
            {modalMode === 'create'
              ? 'Remplissez les détails pour créer une nouvelle sous-variété.'
              : 'Mettre à jour les informations de la sous-variété.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="codsvar" className="block text-sm font-medium text-gray-700 mb-1">
              Code Sous-Variété *
            </label>
            <div className="relative">
              <input
                type="number"
                id="codsvar"
                name="codsvar"
                value={formData.codsvar}
                onChange={handleInputChange}
                onBlur={handleCodeBlur}
                disabled={modalMode === "edit"}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.codsvar ? 'border-red-300' : 'border-gray-300'
                  } ${checkingCode ? 'pr-10' : ''}`}
                placeholder="Entrez le code de la sous-variété"
              />
              {checkingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {formErrors.codsvar && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codsvar}</p>
            )}
            {checkingCode && (
              <p className="mt-1 text-sm text-gray-500">Vérification de la disponibilité du code...</p>
            )}
          </div>

          <div>
            <label htmlFor="nomsvar" className="block text-sm font-medium text-gray-700 mb-1">
              Nom Sous-Variété *
            </label>
            <input
              type="text"
              id="nomsvar"
              name="nomsvar"
              value={formData.nomsvar}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.nomsvar ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Entrez le nom de la sous-variété"
            />
            {formErrors.nomsvar && (
              <p className="mt-1 text-sm text-red-600">{formErrors.nomsvar}</p>
            )}
          </div>

          <div>
            <label htmlFor="codvar" className="block text-sm font-medium text-gray-700 mb-1">
              Code Variété *
            </label>
            <select
              id="codvar"
              name="codvar"
              value={formData.codvar}
              onChange={handleInputChange}
              disabled={loadingVarietes}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.codvar ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="">Sélectionner une variété</option>
              {varietes.map((variete) => (
                <option key={variete.codvar} value={variete.codvar}>
                  {variete.codvar} - {variete.nomvar}
                </option>
              ))}
            </select>
            {formErrors.codvar && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codvar}</p>
            )}
            {loadingVarietes && (
              <p className="mt-1 text-sm text-gray-500">Chargement des variétés...</p>
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
            disabled={submitting || checkingCode || (modalMode === 'create' && formErrors.codsvar)}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sous-Variétés</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos données de sous-variétés</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="sm:inline">Ajouter une Sous-Variété</span>
        </button>
      </div>

      {/* État d'erreur */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des sous-variétés</h3>
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
            <span className="text-gray-600">Chargement des sous-variétés...</span>
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variété
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSousVarietes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <p>Aucune sous-variété trouvée</p>
                        <button
                          onClick={openCreateModal}
                          className="text-primary-600 hover:text-primary-700 text-sm underline"
                        >
                          Créer votre première sous-variété
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSousVarietes.map((sousVariete, index) => (
                    <tr key={sousVariete.codsvar || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sousVariete.codsvar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {sousVariete.nomsvar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getVarietyName(sousVariete.codvar)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(sousVariete)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Modifier la sous-variété"
                          >
                            <Edit size={16} className="text-primary-600" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(sousVariete)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Supprimer la sous-variété"
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
            {paginatedSousVarietes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <p>Aucune sous-variété trouvée</p>
                  <button
                    onClick={openCreateModal}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Créer votre première sous-variété
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedSousVarietes.map((sousVariete, index) => (
                  <div key={sousVariete.codsvar || index} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Code:</span>
                            <span className="text-sm font-medium text-gray-900 truncate">{sousVariete.codsvar}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Nom:</span>
                            <span className="text-sm text-gray-600 truncate">{sousVariete.nomsvar}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Variété:</span>
                            <span className="text-sm text-gray-600 truncate">{getVarietyName(sousVariete.codvar)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openEditModal(sousVariete)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                          title="Modifier la sous-variété"
                        >
                          <Edit size={18} className="text-primary-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(sousVariete)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                          title="Supprimer la sous-variété"
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
      {!loading && !error && sousVarietes.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="sm:text-sm text-xs text-gray-700">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, sousVarietes.length)} sur {sousVarietes.length} résultats
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

export default SousVariete;