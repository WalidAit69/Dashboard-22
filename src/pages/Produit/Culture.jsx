import { Edit, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react";
import API from "../../utils/Api";
import { Modal } from "../../components/ui/Modal";


function Culture() {
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCulture, setSelectedCulture] = useState(null);
  const [formData, setFormData] = useState({ codcul: '', nomcul: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  // Récupérer les données
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/Cultures");

      if (res.data && Array.isArray(res.data)) {
        setCultures(res.data);
      } else {
        setCultures(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cultures:', error);
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
  }, []);

  // Vérifier si le code de culture existe
  const checkCodeExists = async (code) => {
    if (!code || modalMode !== 'create') return;
    // Vérifier d'abord localement
    const existsLocally = cultures.some(culture =>
      culture.codcul.toString().toLowerCase() === code.toString().toLowerCase()
    );

    if (existsLocally) {
      setFormErrors(prev => ({
        ...prev,
        codcul: 'Ce code existe déjà. Veuillez utiliser un code différent.'
      }));
      return;
    }
    try {
      setCheckingCode(true);
      const res = await API.get(`/Cultures/${code}`);

      // Si nous obtenons une réponse sans erreur, le code existe
      if (res.data) {
        setFormErrors(prev => ({
          ...prev,
          codcul: 'Ce code existe déjà. Veuillez utiliser un code différent.'
        }));
      }
    } catch (error) {
      // Si nous obtenons une erreur 404 ou similaire, le code n'existe pas (ce qui est bien)
      if (error.response?.status === 404) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.codcul;
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
    setFormData({ codcul: '', nomcul: '' });
    setFormErrors({});
    setSelectedCulture(null);
    setIsModalOpen(true);
  };

  const openEditModal = (culture) => {
    setModalMode('edit');
    setFormData({ codcul: culture.codcul, nomcul: culture.nomcul });
    setFormErrors({});
    setSelectedCulture(culture);
    setIsModalOpen(true);
  };

  const openDeleteModal = (culture) => {
    setModalMode('delete');
    setSelectedCulture(culture);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('create');
    setSelectedCulture(null);
    setFormData({ codcul: '', nomcul: '' });
    setFormErrors({});
    setSubmitting(false);
    setCheckingCode(false);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.codcul) {
      errors.codcul = 'Le code est requis';
    }

    if (!formData.nomcul?.trim()) {
      errors.nomcul = 'Le nom est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Opérations CRUD
  const handleCreate = async () => {
    if (!validateForm()) return;

    // Ne pas soumettre s'il y a des erreurs de validation existantes (comme un code dupliqué)
    if (formErrors.codcul) return;

    try {
      setSubmitting(true);
      const res = await API.post("/Cultures", formData);

      // Ajouter la nouvelle culture à la liste
      setCultures(prev => [...prev, res.data]);
      closeModal();

      // Afficher un message de succès (vous pouvez implémenter une notification toast ici)
      console.log('Culture créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la culture:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la création de la culture'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await API.put(`/Cultures/${selectedCulture.codcul}`, formData);

      // Mettre à jour la culture dans la liste
      //
      //fetchData()
      // Mise à jour optimiste locale
      setCultures(prev =>
        prev.map(culture =>
          culture.codcul === selectedCulture.codcul
            ? { ...culture, ...formData }
            : culture
        )
      );
      closeModal();

      console.log('Culture mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la culture:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la mise à jour de la culture'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await API.delete(`/Cultures/${selectedCulture.codcul}`);

      // Retirer la culture de la liste
      setCultures(prev =>
        prev.filter(culture => culture.codcul !== selectedCulture.codcul)
      );
      closeModal();

      console.log('Culture supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la culture:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Échec de la suppression de la culture'
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
    if (formData.codcul && modalMode === 'create') {
      checkCodeExists(formData.codcul);
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
              <h3 className="text-lg font-semibold text-gray-900">Supprimer la Culture</h3>
              <p className="text-sm text-gray-600">Cette action ne peut pas être annulée.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer la culture "{selectedCulture?.nomcul}"
              avec le code "{selectedCulture?.codcul}" ?
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
            {modalMode === 'create' ? 'Créer une Nouvelle Culture' : 'Modifier la Culture'}
          </h3>
          <p className="text-sm text-gray-600">
            {modalMode === 'create'
              ? 'Remplissez les détails pour créer une nouvelle culture.'
              : 'Mettre à jour les informations de la culture.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="codcul" className="block text-sm font-medium text-gray-700 mb-1">
              Code *
            </label>
            <div className="relative">
              <input
                type="text"
                id="codcul"
                name="codcul"
                value={formData.codcul}
                onChange={handleInputChange}
                onBlur={handleCodeBlur}
                disabled={modalMode === "edit"}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.codcul ? 'border-red-300' : 'border-gray-300'
                  } ${checkingCode ? 'pr-10' : ''}`}
                placeholder="Entrez le code de la culture"
              />
              {checkingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {formErrors.codcul && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codcul}</p>
            )}
            {checkingCode && (
              <p className="mt-1 text-sm text-gray-500">Vérification de la disponibilité du code...</p>
            )}
          </div>

          <div>
            <label htmlFor="nomcul" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              id="nomcul"
              name="nomcul"
              value={formData.nomcul}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.nomcul ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Entrez le nom de la culture"
            />
            {formErrors.nomcul && (
              <p className="mt-1 text-sm text-red-600">{formErrors.nomcul}</p>
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
            disabled={submitting || checkingCode || (modalMode === 'create' && formErrors.codcul)}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cultures</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos données de culture</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="sm:inline">Ajouter une Culture</span>
        </button>
      </div>

      {/* État d'erreur */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des cultures</h3>
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
            <span className="text-gray-600">Chargement des cultures...</span>
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
                {cultures.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <p>Aucune culture trouvée</p>
                        <button
                          onClick={openCreateModal}
                          className="text-primary-600 hover:text-primary-700 text-sm underline"
                        >
                          Créer votre première culture
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cultures.map((culture, index) => (
                    <tr key={culture.codcul || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {culture.codcul}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {culture.nomcul}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(culture)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Modifier la culture"
                          >
                            <Edit size={16} className="text-primary-600" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(culture)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Supprimer la culture"
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
            {cultures.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <p>Aucune culture trouvée</p>
                  <button
                    onClick={openCreateModal}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Créer votre première culture
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cultures.map((culture, index) => (
                  <div key={culture.codcul || index} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Code:</span>
                            <span className="text-sm font-medium text-gray-900 truncate">{culture.codcul}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium">Nom:</span>
                            <span className="text-sm text-gray-600 truncate">{culture.nomcul}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openEditModal(culture)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                          title="Modifier la culture"
                        >
                          <Edit size={18} className="text-primary-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(culture)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                          title="Supprimer la culture"
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

export default Culture;