import { useEffect, useState } from 'react';
import { Save, X, Edit, Trash2, Plus, ChevronLeft } from 'lucide-react';
import API from '../../../utils/Api';
import ConfirmationModal from "../../../components/producteur/ConfirmationModal"

const AddProdVerger = ({
    producteurID,
    onSuccess,
    onCancel,
    isSubmitting,
    setIsSubmitting,
    submitMessage,
    setSubmitMessage,
}) => {
    // State for station options
    const [stationOptions, setStationOptions] = useState([]);
    const [stationOptionsLoading, setStationOptionsLoading] = useState(false);
    const [refError, setRefError] = useState('');
    const [isCheckingRef, setIsCheckingRef] = useState(false);

    // State for verger data
    const [vergers, setVergers] = useState([]);
    const [vergersLoading, setVergersLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVerger, setEditingVerger] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [vergerToDelete, setVergerToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for verger form
    const [formData, setFormData] = useState({
        refver: '',
        refadh: producteurID || '',
        refStation: '1',
        nomver: '',
        supver: '',
        region: '',
        douar: '',
        locver: '',
        tecver: '',
        disver: '',
        disverf: '',
        coment: '',
        codggn: '',
        certif: 'OUI',
        geoloc: '',
        blocker: 'N',
        Lier: '1',
    });

    // Update refadh when producteurID changes
    useEffect(() => {
        if (producteurID) {
            setFormData(prev => ({
                ...prev,
                refadh: producteurID
            }));
        }
    }, [producteurID]);

    // Fetch vergers for the producer
    const fetchVergers = async () => {
        if (!producteurID) return;

        try {
            setVergersLoading(true);
            const res = await API.get(`/Vergers/ByAdherent/${producteurID}`);

            if (res.data && Array.isArray(res.data)) {
                setVergers(res.data);
            } else {
                setVergers(res.data ? [res.data] : []);
            }
        } catch (error) {
            console.error('Error fetching vergers:', error);
            setVergers([]);
        } finally {
            setVergersLoading(false);
        }
    };

    // Fetch station options
    const fetchStationOptions = async () => {
        try {
            setStationOptionsLoading(true);
            const res = await API.get("/Stations");

            if (res.data && Array.isArray(res.data)) {
                setStationOptions(res.data);
            } else {
                setStationOptions([]);
            }
        } catch (error) {
            console.error('Error fetching station options:', error);
            setStationOptions([]);
        } finally {
            setStationOptionsLoading(false);
        }
    };

    // Fetch options and vergers on component mount
    useEffect(() => {
        fetchStationOptions();
        fetchVergers();
    }, [producteurID]);

    // Function to check if reference already exists
    const checkReferenceExists = async (refId) => {
        if (!refId || refId.trim() === '') {
            setRefError('');
            return;
        }

        // Skip check if editing and reference hasn't changed
        if (editingVerger && editingVerger.refver.toString() === refId.toString()) {
            setRefError('');
            return;
        }

        setIsCheckingRef(true);
        setRefError('');

        try {
            const response = await API.get(`/Vergers/${refId}`);

            // If we get a response, it means the reference exists
            if (response.data) {
                setRefError('Cette référence est déjà utilisée');
            }
        } catch (err) {
            // If we get a 404 or similar error, the reference doesn't exist (which is good)
            if (err.response?.status === 404) {
                setRefError(''); // Reference is available
            } else {
                // Other errors (network, server, etc.)
                setRefError('Erreur lors de la vérification de la référence');
            }
        } finally {
            setIsCheckingRef(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear reference error when user starts typing a new reference
        if (field === 'refver') {
            setRefError('');
        }
    };

    // Handle blur event for reference field
    const handleReferenceBlur = () => {
        const refValue = formData.refver.trim();
        if (refValue) {
            checkReferenceExists(refValue);
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            refver: '',
            refadh: producteurID || '',
            refStation: '1',
            nomver: '',
            supver: '',
            region: '',
            douar: '',
            locver: '',
            tecver: '',
            disver: '',
            disverf: '',
            coment: '',
            codggn: '',
            certif: 'OUI',
            geoloc: '',
            blocker: 'N',
            Lier: '1',
        });
        setRefError('');
        setEditingVerger(null);
    };

    // Handle edit verger
    const handleEditVerger = (verger) => {
        setFormData({
            refver: verger.refver?.toString() || '',
            refadh: verger.refadh?.toString() || producteurID || '',
            refStation: verger.refStation?.toString() || '1',
            nomver: verger.nomver || '',
            supver: verger.supver?.toString() || '',
            region: verger.region || '',
            douar: verger.douar || '',
            locver: verger.locver || '',
            tecver: verger.tecver || '',
            disver: verger.disver?.toString() || '',
            disverf: verger.disverf?.toString() || '',
            coment: verger.coment || '',
            codggn: verger.codggn || '',
            certif: verger.certif || 'OUI',
            geoloc: verger.geoloc || '',
            blocker: verger.blocker || 'N',
            Lier: verger.Lier || '1',
        });
        setEditingVerger(verger);
        setShowAddForm(true);
    };

    const validateForm = () => {
        // Field mapping with their user-friendly labels
        const fieldLabels = {
            nomver: 'Libellé Verger',
            refStation: 'Station',
            supver: 'Superficie',
            region: 'Région',
            douar: 'Adresse',
            locver: 'Localisation',
            tecver: 'Technicien'
        };

        const required = ['nomver', 'refStation', 'supver', 'region', 'douar', 'locver', 'tecver'];
        const missing = required.filter(field => !formData[field] || formData[field].toString().trim() === '');

        if (missing.length > 0) {
            const missingLabels = missing.map(field => fieldLabels[field]);
            setSubmitMessage(`Champs requis manquants: ${missingLabels.join(', ')}`);
            return false;
        }

        // Check if reference has an error
        if (refError) {
            setSubmitMessage('Veuillez corriger l\'erreur de référence avant de continuer');
            return false;
        }

        // Validate numeric fields
        if (formData.supver && isNaN(parseFloat(formData.supver))) {
            setSubmitMessage('La superficie doit être un nombre valide');
            return false;
        }

        if (formData.disver && isNaN(parseFloat(formData.disver))) {
            setSubmitMessage('La distance doit être un nombre valide');
            return false;
        }

        if (formData.disverf && isNaN(parseFloat(formData.disverf))) {
            setSubmitMessage('La distance F doit être un nombre valide');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            // Convert numeric fields to proper types
            const submitData = {
                ...formData,
                refver: formData.refver ? parseInt(formData.refver) : null,
                refadh: parseInt(formData.refadh),
                refStation: parseInt(formData.refStation),
                supver: parseFloat(formData.supver),
                disver: formData.disver ? parseFloat(formData.disver) : 0,
                disverf: formData.disverf ? parseFloat(formData.disverf) : 0,
            };

            let response;
            if (editingVerger) {
                // Update existing verger
                response = await API.put(`/Vergers/${editingVerger.refver}`, submitData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setSubmitMessage('Verger modifié avec succès!');
            } else {
                // Create new verger
                response = await API.post('/Vergers', submitData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setSubmitMessage('Verger ajouté avec succès!');
            }

            if (response.status === 200 || response.status === 201 || response.status === 204) {
                // Reset form and close form
                resetForm();
                setShowAddForm(false);

                // Refresh vergers list
                fetchVergers();

                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                throw new Error('Erreur lors de l\'opération');
            }
        } catch (error) {
            setSubmitMessage('Erreur: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        resetForm();
        setShowAddForm(false);
        setSubmitMessage('');
    };

    // Get station name by ID
    const getStationName = (stationId) => {
        const station = stationOptions.find(s => s.refsta.toString() === stationId.toString());
        return station ? `${station.nomsta} - ${station.refsta}` : `Station ${stationId}`;
    };

    const handleDeleteVerger = (verger) => {
        setVergerToDelete(verger);
        setDeleteModalOpen(true);
    };

    // Add this new function to handle the actual deletion
    const confirmDeleteVerger = async () => {
        if (!vergerToDelete) return;

        setIsDeleting(true);
        setSubmitMessage('');

        try {
            await API.delete(`/Vergers/${vergerToDelete.refver}`);
            setSubmitMessage('Verger supprimé avec succès!');
            fetchVergers(); // Refresh the list
            setDeleteModalOpen(false);
            setVergerToDelete(null);
        } catch (error) {
            setSubmitMessage('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsDeleting(false);
        }
    };

    // Add this function to handle modal close
    const handleCloseDeleteModal = () => {
        if (!isDeleting) {
            setDeleteModalOpen(false);
            setVergerToDelete(null);
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des Vergers</h3>
                <div className="flex space-x-2">
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            <Plus size={16} />
                            <span>Ajouter Verger</span>
                        </button>
                    )}
                </div>

                {showAddForm && <div className=''>
                    <button
                        onClick={() => setShowAddForm(false)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-black px-6 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                    >
                        <ChevronLeft size={18} />
                        <span>Back</span>
                    </button>
                </div>}
            </div>

            {/* Success/Error Message */}
            {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg ${submitMessage.includes('succès')
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                    {submitMessage}
                </div>
            )}

            {/* Existing Vergers List */}
            {!showAddForm && (
                <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Vergers existants</h4>

                    {vergersLoading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Chargement des vergers...</p>
                        </div>
                    ) : vergers.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Aucun verger trouvé pour ce producteur.</p>
                            <p className="text-sm text-gray-400 mt-1">Cliquez sur "Ajouter Verger" pour commencer.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {vergers.map((verger, index) => (
                                <div key={verger.refver || index} className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Référence:</span>
                                                    <p className="text-gray-900">{verger.refver || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Nom:</span>
                                                    <p className="text-gray-900">{verger.nomver || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Superficie:</span>
                                                    <p className="text-gray-900">{verger.supver || 0} ha</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Région:</span>
                                                    <p className="text-gray-900">{verger.region || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Station:</span>
                                                    <p className="text-gray-900">{getStationName(verger.refStation)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Technicien:</span>
                                                    <p className="text-gray-900">{verger.tecver || 'N/A'}</p>
                                                </div>
                                            </div>
                                            {verger.coment && (
                                                <div className="mt-3">
                                                    <span className="text-sm font-medium text-gray-600">Remarque:</span>
                                                    <p className="text-gray-900 text-sm">{verger.coment}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditVerger(verger)}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVerger(verger)}
                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="mt-2">
                    <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900">
                            {editingVerger ? 'Modifier le Verger' : 'Ajouter un Nouveau Verger'}
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Reference Verger */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Référence Verger
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={0}
                                    value={formData.refver}
                                    onChange={(e) => handleInputChange('refver', e.target.value)}
                                    onBlur={handleReferenceBlur}
                                    disabled={!!editingVerger}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${editingVerger ? 'bg-gray-100' : ''} ${refError
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-primary-500'
                                        }`}
                                    placeholder="Référence du verger (optionnel)"
                                />
                                {isCheckingRef && (
                                    <div className="absolute right-3 top-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                                    </div>
                                )}
                            </div>
                            {refError && (
                                <p className="mt-1 text-sm text-red-600">{refError}</p>
                            )}
                        </div>

                        {/* Producteur ID (Hidden/Display Only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Producteur ID
                            </label>
                            <input
                                type="number"
                                value={formData.refadh}
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="ID du producteur"
                            />
                        </div>

                        {/* Station */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Station <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.refStation}
                                onChange={(e) => handleInputChange('refStation', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                disabled={stationOptionsLoading}
                            >
                                <option value="">Sélectionner une station</option>
                                {stationOptions.map(station => (
                                    <option key={station.refsta} value={station.refsta}>
                                        {station.nomsta} - {station.refsta}
                                    </option>
                                ))}
                            </select>
                            {stationOptionsLoading && (
                                <p className="mt-1 text-sm text-gray-500">Chargement des stations...</p>
                            )}
                        </div>

                        {/* Libelle Verger */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Libellé Verger <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.nomver}
                                onChange={(e) => handleInputChange('nomver', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Nom du verger"
                            />
                        </div>

                        {/* Superficie */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Superficie (ha) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.supver}
                                onChange={(e) => handleInputChange('supver', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Région */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Région <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.region}
                                onChange={(e) => handleInputChange('region', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Nom de la région"
                            />
                        </div>

                        {/* Adresse */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.douar}
                                onChange={(e) => handleInputChange('douar', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Adresse du verger"
                            />
                        </div>

                        {/* Localisation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Localisation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.locver}
                                onChange={(e) => handleInputChange('locver', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Localisation précise"
                            />
                        </div>

                        {/* Technicien */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Technicien <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.tecver}
                                onChange={(e) => handleInputChange('tecver', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Nom du technicien"
                            />
                        </div>

                        {/* Distance */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Distance
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.disver}
                                onChange={(e) => handleInputChange('disver', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Distance F */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Distance F
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.disverf}
                                onChange={(e) => handleInputChange('disverf', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Code GGN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Code GGN
                            </label>
                            <input
                                type="text"
                                value={formData.codggn}
                                onChange={(e) => handleInputChange('codggn', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Code GGN"
                            />
                        </div>

                        {/* GeoLocalisation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GeoLocalisation
                            </label>
                            <input
                                type="text"
                                value={formData.geoloc}
                                onChange={(e) => handleInputChange('geoloc', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Coordonnées géographiques"
                            />
                        </div>

                        {/* Remarque - Full width */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarque
                            </label>
                            <textarea
                                rows={4}
                                value={formData.coment}
                                onChange={(e) => handleInputChange('coment', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Remarques ou commentaires..."
                            />
                        </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex space-x-4 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || refError}
                            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save size={18} />
                            <span>{isSubmitting ? (editingVerger ? 'Modification...' : 'Enregistrement...') : (editingVerger ? 'Modifier' : 'Enregistrer')}</span>
                        </button>
                        <button
                            onClick={handleCancelForm}
                            className="flex items-center space-x-2 text-gray-600 hover:text-black px-6 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                        >
                            <X size={18} />
                            <span>Annuler</span>
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={confirmDeleteVerger}
                title="Supprimer le verger"
                message="Êtes-vous sûr de vouloir supprimer le verger {itemName} ? Cette action est irréversible."
                itemName={vergerToDelete?.nomver}
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={isDeleting}
                loadingText="Suppression en cours..."
                type="danger"
            />
        </div>
    );
};

export default AddProdVerger;