import { Edit, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react";
import API from "../../utils/Api";
import Modal from "../../components/ui/Modal";

function Variete() {
  const [varietes, setVarietes] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [groupeVarietes, setGroupeVarietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCultures, setLoadingCultures] = useState(false);
  const [loadingGroupeVarietes, setLoadingGroupeVarietes] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVariete, setSelectedVariete] = useState(null);
  const [formData, setFormData] = useState({
    codvar: '',
    nomvar: '',
    codcul: '',
    codgrv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedVarietes, setPaginatedVarietes] = useState([]);

  // Récupérer les données
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/Varietes");

      if (res.data && Array.isArray(res.data)) {
        setVarietes(res.data);
      } else {
        setVarietes(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des variétés:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Échec de la récupération des données',
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCultures();
    fetchGroupeVarietes();
  }, []);

  useEffect(() => {
    // Calculate pagination whenever varietes changes
    const total = Math.ceil(varietes.length / itemsPerPage);
    setTotalPages(total);

    // Reset to page 1 if current page is beyond total pages
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [varietes, itemsPerPage, currentPage]);

  // handle paginated data
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedVarietes(varietes.slice(startIndex, endIndex));
  }, [varietes, currentPage, itemsPerPage]);

  // Helper functions to get names
  const getCultureName = (codcul) => {
    const culture = cultures.find(c => c.codcul === codcul);
    return culture ? `${culture.codcul} - ${culture.nomcul}` : codcul;
  };

  const getGroupeVarieteName = (codgrv) => {
    const groupeVariete = groupeVarietes.find(g => g.codgrv === codgrv);
    return groupeVariete ? `${groupeVariete.codgrv} - ${groupeVariete.nomgrv}` : codgrv;
  };

  const fetchCultures = async () => {
    try {
      setLoadingCultures(true);
      const res = await API.get("/Cultures");

      if (res.data && Array.isArray(res.data)) {
        setCultures(res.data);
      } else {
        setCultures(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cultures:', error);
      // Handle error if needed
    } finally {
      setLoadingCultures(false);
    }
  };

  const fetchGroupeVarietes = async () => {
    try {
      setLoadingGroupeVarietes(true);
      const res = await API.get("/GroupVarietes");

      if (res.data && Array.isArray(res.data)) {
        setGroupeVarietes(res.data);
      } else {
        setGroupeVarietes(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes variétés:', error);
      // Handle error if needed
    } finally {
      setLoadingGroupeVarietes(false);
    }
  };

  // Vérifier si le code de variété existe
  const checkCodeExists = async (code) => {
    if (!code || modalMode !== 'create') return;

    const intCode = parseInt(code, 10);  // Convert to integer
    if (isNaN(intCode)) return;  // Skip if not a valid number

    // Check locally first
    const existsLocally = varietes.some(variete =>
      parseInt(variete.codvar, 10) === intCode  // Convert both to int for comparison
    );

    if (existsLocally) {
      setFormErrors(prev => ({
        ...prev,
        codvar: 'Ce code existe déjà. Veuillez utiliser un code différent.'
      }));
      return;
    }

    try {
      setCheckingCode(true);
      const res = await API.get(`/Varietes/${intCode}`);  // Use integer value

      // If we get a response without error, the code exists
      if (res.data) {
        setFormErrors(prev => ({
          ...prev,
          codvar: 'Ce code existe déjà. Veuillez utiliser un code différent.'
        }));
      }
    } catch (error) {
      // If we get a 404 or similar error, the code doesn't exist (which is good)
      if (error.response?.status === 404) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.codvar;
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
    setFormData({
      codvar: '',
      nomvar: '',
      codcul: '',
      codgrv: '',
    });
    setFormErrors({});
    setSelectedVariete(null);
    setIsModalOpen(true);
  };

  const openEditModal = (variete) => {
    setModalMode('edit');
    setFormData({
      codvar: parseInt(variete.codvar, 10),
      nomvar: variete.nomvar,
      codcul: parseInt(variete.codcul, 10),
      codgrv: parseInt(variete.codgrv, 10),
    });
    setFormErrors({});
    setSelectedVariete(variete);
    setIsModalOpen(true);
  };

  const openDeleteModal = (variete) => {
    setModalMode('delete');
    setSelectedVariete(variete);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('create');
    setSelectedVariete(null);
    setFormData({
      codvar: '',
      nomvar: '',
      codcul: '',
      codgrv: '',
    });
    setFormErrors({});
    setSubmitting(false);
    setCheckingCode(false);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.codvar) {
      errors.codvar = 'Le code est requis';
    } else if (isNaN(parseInt(formData.codvar, 10))) {  // Check if it's a valid number
      errors.codvar = 'Le code doit être un nombre valide';
    }

    if (!formData.nomvar?.trim()) {
      errors.nomvar = 'Le nom est requis';
    }

    if (!formData.codcul) {
      errors.codcul = 'Le code culture est requis';
    } else if (isNaN(parseInt(formData.codcul, 10))) {  // Check if it's a valid number
      errors.codcul = 'Le code culture doit être un nombre valide';
    }

    if (!formData.codgrv) {
      errors.codgrv = 'Le code groupe variété est requis';
    } else if (isNaN(parseInt(formData.codgrv, 10))) {  // Check if it's a valid number
      errors.codgrv = 'Le code groupe variété doit être un nombre valide';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Opérations CRUD
  const handleCreate = async () => {
    if (!validateForm()) return;

    // Ne pas soumettre s'il y a des erreurs de validation existantes (comme un code dupliqué)
    if (formErrors.codvar) return;

    try {
      setSubmitting(true);
      const res = await API.post("/Varietes", formData);

      // Ajouter la nouvelle variété à la liste
      setVarietes(prev => [...prev, res.data]);
      closeModal();

      // Afficher un message de succès (vous pouvez implémenter une notification toast ici)
      console.log('Variété créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la création de la variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await API.put(`/Varietes/${selectedVariete.codvar}`, formData);

      // Mettre à jour la variété dans la liste
      setVarietes(prev =>
        prev.map(variete =>
          variete.codvar === selectedVariete.codvar
            ? { ...variete, ...formData }
            : variete
        )
      );
      closeModal();

      console.log('Variété mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la mise à jour de la variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await API.delete(`/Varietes/${selectedVariete.codvar}`);

      // Retirer la variété de la liste
      setVarietes(prev =>
        prev.filter(variete => variete.codvar !== selectedVariete.codvar)
      );
      closeModal();

      console.log('Variété supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la variété:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la suppression de la variété'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Gestionnaire d'entrée de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert numeric fields to integers
    let processedValue = value;
    if (name === 'codvar' || name === 'codcul' || name === 'codgrv') {
      processedValue = value === '' ? '' : parseInt(value, 10);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

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
    if (formData.codvar && modalMode === 'create') {
      checkCodeExists(formData.codvar);
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
              <h3 className="text-lg font-semibold text-gray-900">Supprimer la Variété</h3>
              <p className="text-sm text-gray-600">Cette action ne peut pas être annulée.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer la variété "{selectedVariete?.nomvar}"
              avec le code "{selectedVariete?.codvar}" ?
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
            {modalMode === 'create' ? 'Créer une Nouvelle Variété' : 'Modifier la Variété'}
          </h3>
          <p className="text-sm text-gray-600">
            {modalMode === 'create'
              ? 'Remplissez les détails pour créer une nouvelle variété.'
              : 'Mettre à jour les informations de la variété.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="codvar" className="block text-sm font-medium text-gray-700 mb-1">
              Code Variété *
            </label>
            <div className="relative">
              <input
                type="number"
                id="codvar"
                name="codvar"
                value={formData.codvar}
                onChange={handleInputChange}
                onBlur={handleCodeBlur}
                disabled={modalMode === "edit"}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.codvar ? 'border-red-300' : 'border-gray-300'
                  } ${checkingCode ? 'pr-10' : ''}`}
                placeholder="Entrez le code de la variété"
              />
              {checkingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {formErrors.codvar && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codvar}</p>
            )}
            {checkingCode && (
              <p className="mt-1 text-sm text-gray-500">Vérification de la disponibilité du code...</p>
            )}
          </div>

          <div>
            <label htmlFor="nomvar" className="block text-sm font-medium text-gray-700 mb-1">
              Nom Variété *
            </label>
            <input
              type="text"
              id="nomvar"
              name="nomvar"
              value={formData.nomvar}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.nomvar ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Entrez le nom de la variété"
            />
            {formErrors.nomvar && (
              <p className="mt-1 text-sm text-red-600">{formErrors.nomvar}</p>
            )}
          </div>

          <div>
            <label htmlFor="codcul" className="block text-sm font-medium text-gray-700 mb-1">
              Code Culture *
            </label>
            <select
              id="codcul"
              name="codcul"
              value={formData.codcul}
              onChange={handleInputChange}
              disabled={loadingCultures}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.codcul ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="">Sélectionner une culture</option>
              {cultures.map((culture) => (
                <option key={culture.codcul} value={culture.codcul}>
                  {culture.codcul} - {culture.nomcul}
                </option>
              ))}
            </select>
            {formErrors.codcul && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codcul}</p>
            )}
            {loadingCultures && (
              <p className="mt-1 text-sm text-gray-500">Chargement des cultures...</p>
            )}
          </div>

          <div>
            <label htmlFor="codgrv" className="block text-sm font-medium text-gray-700 mb-1">
              Code Groupe Variété *
            </label>
            <select
              id="codgrv"
              name="codgrv"
              value={formData.codgrv}
              onChange={handleInputChange}
              disabled={loadingGroupeVarietes}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.codgrv ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="">Sélectionner un groupe variété</option>
              {groupeVarietes.map((groupeVariete) => (
                <option key={groupeVariete.codgrv} value={groupeVariete.codgrv}>
                  {groupeVariete.codgrv} - {groupeVariete.nomgrv}
                </option>
              ))}
            </select>
            {formErrors.codgrv && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codgrv}</p>
            )}
            {loadingGroupeVarietes && (
              <p className="mt-1 text-sm text-gray-500">Chargement des groupes variétés...</p>
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
            disabled={submitting || checkingCode || (modalMode === 'create' && formErrors.codvar)}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Variétés</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos données de variétés</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="sm:inline">Ajouter une Variété</span>
        </button>
      </div>

      {/* État d'erreur */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des variétés</h3>
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
            <span className="text-gray-600">Chargement des variétés...</span>
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
                    Culture
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groupe Variété
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVarietes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <p>Aucune variété trouvée</p>
                        <button
                          onClick={openCreateModal}
                          className="text-primary-600 hover:text-primary-700 text-sm underline"
                        >
                          Créer votre première variété
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedVarietes.map((variete, index) => (
                    <tr key={variete.codvar || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {variete.codvar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {variete.nomvar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getCultureName(variete.codcul)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getGroupeVarieteName(variete.codgrv)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(variete)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Modifier la variété"
                          >
                            <Edit size={16} className="text-primary-600" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(variete)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Supprimer la variété"
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
            {paginatedVarietes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <p>Aucune variété trouvée</p>
                  <button
                    onClick={openCreateModal}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Créer votre première variété
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedVarietes.map((variete, index) => (
                  <div key={variete.codvar || index} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Code:</span>
                            <span className="text-sm font-medium text-gray-900 truncate">{variete.codvar}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Nom:</span>
                            <span className="text-sm text-gray-600 truncate">{variete.nomvar}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Culture:</span>
                            <span className="text-sm text-gray-600 truncate">{getCultureName(variete.codcul)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Groupe:</span>
                            <span className="text-sm text-gray-600 truncate">{getGroupeVarieteName(variete.codgrv)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openEditModal(variete)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                          title="Modifier la variété"
                        >
                          <Edit size={18} className="text-primary-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(variete)}
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
      )}

      {/* Pagination */}
      {!loading && !error && varietes.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="sm:text-sm text-xs text-gray-700">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, varietes.length)} sur {varietes.length} résultats
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

export default Variete;