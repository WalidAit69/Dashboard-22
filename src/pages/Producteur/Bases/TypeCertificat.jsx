import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import API from "../../../utils/Api";
import Modal from "../../../components/ui/Modal";

function TypeCertificat() {
  const [typeCertificats, setTypeCertificats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedTypeCertificat, setSelectedTypeCertificat] = useState(null);
  const [formData, setFormData] = useState({ nomType: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Charger les données depuis l'API
  const fetchTypeCertificats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/TypeCertificat");

      if (res.data && Array.isArray(res.data)) {
        setTypeCertificats(res.data);
      } else {
        setTypeCertificats(res.data ? [res.data] : []);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des types de certificat:', err);
      setError({
        message: err.response?.data?.message || err.message || 'Échec de la récupération des données',
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchTypeCertificats();
  }, []);

  // Filtrer les types de certificat selon le terme de recherche
  const filteredTypeCertificats = typeCertificats.filter(typeCertificat =>
    typeCertificat.nomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    typeCertificat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestionnaires de modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ nomType: '', description: '' });
    setFormErrors({});
    setSelectedTypeCertificat(null);
    setIsModalOpen(true);
  };

  const openEditModal = (typeCertificat) => {
    setModalMode('edit');
    setFormData({ 
      nomType: typeCertificat.nomType,
      description: typeCertificat.description || ''
    });
    setFormErrors({});
    setSelectedTypeCertificat(typeCertificat);
    setIsModalOpen(true);
  };

  const openDeleteModal = (typeCertificat) => {
    setModalMode('delete');
    setSelectedTypeCertificat(typeCertificat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('create');
    setSelectedTypeCertificat(null);
    setFormData({ nomType: '', description: '' });
    setFormErrors({});
    setSubmitting(false);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.nomType?.trim()) {
      errors.nomType = 'Le nom du type est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ajouter un nouveau type de certificat
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await API.post("/TypeCertificat", {
        nomType: formData.nomType.trim(),
        description: formData.description?.trim() || null
      });

      // Ajouter le nouveau type de certificat à la liste
      setTypeCertificats(prev => [...prev, res.data]);
      closeModal();

      console.log('Type de certificat créé avec succès');
    } catch (err) {
      console.error('Erreur lors de la création du type de certificat:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Échec de la création du type de certificat'
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
      const res = await API.put(`/TypeCertificat/${selectedTypeCertificat.idTypeCertificat}`, {
        idTypeCertificat: selectedTypeCertificat.idTypeCertificat,
        nomType: formData.nomType.trim(),
        description: formData.description?.trim() || null
      });

      // Mettre à jour le type de certificat dans la liste
      setTypeCertificats(prev =>
        prev.map(typeCertificat =>
          typeCertificat.idTypeCertificat === selectedTypeCertificat.idTypeCertificat
            ? { ...typeCertificat, nomType: formData.nomType, description: formData.description }
            : typeCertificat
        )
      );
      closeModal();

      console.log('Type de certificat mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du type de certificat:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Échec de la mise à jour du type de certificat'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un type de certificat
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await API.delete(`/TypeCertificat/${selectedTypeCertificat.idTypeCertificat}`);

      // Retirer le type de certificat de la liste
      setTypeCertificats(prev =>
        prev.filter(typeCertificat => typeCertificat.idTypeCertificat !== selectedTypeCertificat.idTypeCertificat)
      );
      closeModal();

      console.log('Type de certificat supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du type de certificat:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Échec de la suppression du type de certificat'
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
              <h3 className="text-lg font-semibold text-gray-900">Supprimer le Type de Certificat</h3>
              <p className="text-sm text-gray-600">Cette action ne peut pas être annulée.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer le type de certificat "{selectedTypeCertificat?.nomType}" ?
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalMode === 'create' ? 'Créer un Nouveau Type de Certificat' : 'Modifier le Type de Certificat'}
          </h3>
          <p className="text-sm text-gray-600">
            {modalMode === 'create'
              ? 'Remplissez les informations pour créer un nouveau type de certificat.'
              : 'Mettre à jour les informations du type de certificat.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="nomType" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du Type *
            </label>
            <input
              type="text"
              id="nomType"
              name="nomType"
              value={formData.nomType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.nomType ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Ex: Bio, GlobalGAP, ISO 14001"
            />
            {formErrors.nomType && (
              <p className="mt-1 text-sm text-red-600">{formErrors.nomType}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Description du type de certificat..."
            />
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
            disabled={submitting}
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
            <span className="text-gray-600">Chargement des types de certificat...</span>
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
            <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des types de certificat</h3>
            <p className="text-sm text-red-700 mt-1 break-words">{error.message}</p>
            {error.status && (
              <p className="text-xs text-red-600 mt-1">Statut: {error.status}</p>
            )}
            <button
              onClick={fetchTypeCertificats}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Types de Certificat</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos types de certificat</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="sm:inline">Ajouter un Type</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom ou description..."
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
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom du Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTypeCertificats.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>
                        {searchTerm ? 'Aucun type de certificat trouvé pour cette recherche.' : 'Aucun type de certificat trouvé'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={openCreateModal}
                          className="text-primary-600 hover:text-primary-700 text-sm underline"
                        >
                          Créer votre premier type de certificat
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTypeCertificats.map((typeCertificat, index) => (
                  <tr key={typeCertificat.idTypeCertificat || index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{typeCertificat.idTypeCertificat}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{typeCertificat.nomType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {typeCertificat.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(typeCertificat)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Modifier le type de certificat"
                        >
                          <Edit2 size={16} className="text-primary-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(typeCertificat)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Supprimer le type de certificat"
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
          {filteredTypeCertificats.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <p>
                  {searchTerm ? 'Aucun type de certificat trouvé pour cette recherche.' : 'Aucun type de certificat trouvé'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openCreateModal}
                    className="text-primary-600 hover:text-primary-700 text-sm underline"
                  >
                    Créer votre premier type de certificat
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTypeCertificats.map((typeCertificat, index) => (
                <div key={typeCertificat.idTypeCertificat || index} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 uppercase font-medium">ID:</span>
                          <span className="text-sm font-medium text-gray-900">{typeCertificat.idTypeCertificat}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 uppercase font-medium mt-0.5">Nom:</span>
                          <span className="text-sm text-gray-900 font-medium break-words">{typeCertificat.nomType}</span>
                        </div>
                        {typeCertificat.description && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-500 uppercase font-medium mt-0.5">Desc:</span>
                            <span className="text-sm text-gray-600 break-words">{typeCertificat.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => openEditModal(typeCertificat)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                        title="Modifier le type de certificat"
                      >
                        <Edit2 size={18} className="text-primary-600" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(typeCertificat)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                        title="Supprimer le type de certificat"
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
        Total: {filteredTypeCertificats.length} type(s) de certificat
        {searchTerm && ` (${typeCertificats.length} au total)`}
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

export default TypeCertificat;