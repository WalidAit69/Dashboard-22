import { useEffect, useState } from 'react';
import { MapPin, TreePine, Settings, Info, Save, X, ChevronLeft, Edit, Trash2, Plus } from 'lucide-react';
import API from '../../../utils/Api';
import ConfirmationModal from "../../../components/producteur/ConfirmationModal"

const AddProdParcelle = ({
    producteurID,
    vergers = [],
    onSuccess,
    onCancel,
    isSubmitting,
    setIsSubmitting,
    submitMessage,
    setSubmitMessage
}) => {
    const [activeTab, setActiveTab] = useState('General');
    const [refError, setRefError] = useState('');
    const [isCheckingRef, setIsCheckingRef] = useState(false);

    // State for parcelle data
    const [parcelles, setParcelles] = useState([]);
    const [parcellesLoading, setParcellesLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingParcelle, setEditingParcelle] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [parcelleToDelete, setParcelleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for dropdown options
    const [cultures, setCultures] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(false);

    // State for cascading dropdown options - UPDATED LOGIC
    const [cascadingOptions, setCascadingOptions] = useState({
        allVarietes: [], // Store all varietes for filtering
        allSousVarietes: [], // Store all sous-varietes for filtering
        filteredVarietes: [], // Current filtered varietes
        filteredSousVarietes: [] // Current filtered sous-varietes
    });

    // Store original reference for checking duplicates (for editing)
    const [originalRef, setOriginalRef] = useState('');

    const [formData, setFormData] = useState({
        refpar: '',
        suppar: '',
        nbrarb: '',
        ecarte: '',
        espace: '',
        latitude: '',
        longitude: '',
        irriga: '',
        typefilet: '',
        dtepln: '',
        traite: 'NON',
        certif: 'NON',
        couverture: 'N',
        estimation: '',
        refver: '',
        numcul: '',
        codsvar: '',
        codvar: '',
    });

    const tabs = [
        { id: 'General', label: 'Général', icon: Info },
        { id: 'Location', label: 'Localisation', icon: MapPin },
        { id: 'Cultivation', label: 'Culture', icon: TreePine },
        { id: 'Technical', label: 'Technique', icon: Settings },
    ];

    // Fetch parcelles for the producer
    const fetchParcelles = async () => {
        if (!producteurID) return;

        try {
            setParcellesLoading(true);

            const res = await API.get(`/Parcelles/ByAdherentWithVerger/${producteurID}`);

            if (res.data && Array.isArray(res.data)) {
                // Extract just the parcelle objects from the response
                setParcelles(res.data.map(item => item.parcelle));
            } else if (res.data && res.data.parcelle) {
                // Single item response
                setParcelles([res.data.parcelle]);
            } else {
                setParcelles([]);
            }
        } catch (error) {
            console.error('Error fetching parcelles:', error);
            setParcelles([]);
        } finally {
            setParcellesLoading(false);
        }
    };

    // Fetch dropdown options
    const fetchOptions = async () => {
        try {
            setOptionsLoading(true);

            const [culturesRes, varietesRes, sousVarietesRes] = await Promise.all([
                API.get("/Cultures"),
                API.get("/Varietes"),
                API.get("/SousVarietes"),
            ]);

            setCultures(Array.isArray(culturesRes.data) ? culturesRes.data : []);

            // Store all varietes and sous-varietes for cascading filtering - UPDATED LOGIC
            setCascadingOptions(prev => ({
                ...prev,
                allVarietes: Array.isArray(varietesRes.data) ? varietesRes.data : [],
                allSousVarietes: Array.isArray(sousVarietesRes.data) ? sousVarietesRes.data : [],
            }));
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setOptionsLoading(false);
        }
    };

    // Initialize cascading filters based on existing data - NEW FUNCTION
    const initializeCascadingFilters = (parcelleData) => {
        const { numcul, codvar } = parcelleData;

        if (numcul && cascadingOptions.allVarietes.length > 0) {
            // Filter varietes by culture - FIXED LOGIC
            const filteredVarietes = cascadingOptions.allVarietes.filter(v =>
                v.codcul && Number(v.codcul) === Number(numcul)
            );

            if (codvar && cascadingOptions.allSousVarietes.length > 0) {
                // Filter sous-varietes by variety
                const filteredSousVarietes = cascadingOptions.allSousVarietes.filter(sv =>
                    sv.codvar && Number(sv.codvar) === Number(codvar)
                );

                setCascadingOptions(prev => ({
                    ...prev,
                    filteredVarietes,
                    filteredSousVarietes
                }));
            } else {
                setCascadingOptions(prev => ({
                    ...prev,
                    filteredVarietes,
                    filteredSousVarietes: []
                }));
            }
        }
    };

    // Update cascading filters when options are loaded and form data is available - NEW USEEFFECT
    useEffect(() => {
        if (cascadingOptions.allVarietes.length > 0 && formData.numcul) {
            initializeCascadingFilters(formData);
        }
    }, [cascadingOptions.allVarietes, cascadingOptions.allSousVarietes, formData.numcul, formData.codvar]);

    // Fetch options and parcelles when component mounts or vergers change
    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        if (vergers.length > 0) {
            fetchParcelles();
        }
    }, [vergers, producteurID]);

    // Function to check if reference already exists - NEW FUNCTION
    const checkReferenceExists = async (refId) => {
        if (!refId || refId.trim() === '' || refId.trim() === originalRef) {
            setRefError('');
            return;
        }

        setIsCheckingRef(true);
        setRefError('');

        try {
            const response = await API.get(`/Parcelles`);
            const allParcelles = Array.isArray(response.data) ? response.data : [];

            // Check if reference exists (excluding current parcelle when editing)
            const existingParcelle = allParcelles.find(p =>
                p.refpar &&
                p.refpar.toString() === refId.trim() &&
                (!editingParcelle || p.idparcelle.toString() !== editingParcelle.idparcelle.toString())
            );

            if (existingParcelle) {
                setRefError('Cette référence est déjà utilisée par une autre parcelle');
            }
        } catch (err) {
            console.error('Error checking reference:', err);
            setRefError('Erreur lors de la vérification de la référence');
        } finally {
            setIsCheckingRef(false);
        }
    };

    // Handle blur event for reference field - NEW FUNCTION
    const handleReferenceBlur = () => {
        const refValue = formData.refpar.trim();
        if (refValue) {
            checkReferenceExists(refValue);
        }
    };

    // Handle cascading dropdown changes - UPDATED LOGIC TO MATCH EditParcelle
    const handleCascadingChange = (field, value) => {
        if (field === 'numcul') {
            // When culture changes, filter varietes and clear dependent fields
            setFormData(prev => ({
                ...prev,
                numcul: value,
                codvar: '', // Clear variety
                codsvar: '' // Clear sub-variety
            }));

            if (value) {
                // Filter varietes by selected culture - FIXED PROPERTY NAME
                const filteredVarietes = cascadingOptions.allVarietes.filter(v =>
                    v.codcul && Number(v.codcul) === Number(value)
                );

                setCascadingOptions(prev => ({
                    ...prev,
                    filteredVarietes,
                    filteredSousVarietes: [] // Clear sous-varietes when culture changes
                }));
            } else {
                // Clear all filtered options when no culture is selected
                setCascadingOptions(prev => ({
                    ...prev,
                    filteredVarietes: [],
                    filteredSousVarietes: []
                }));
            }
        } else if (field === 'codvar') {
            // When variety changes, filter sous-varietes
            setFormData(prev => ({
                ...prev,
                codvar: value,
                codsvar: '' // Clear sub-variety
            }));

            if (value) {
                // Filter sous-varietes by selected variety
                const filteredSousVarietes = cascadingOptions.allSousVarietes.filter(sv =>
                    sv.codvar && Number(sv.codvar) === Number(value)
                );

                setCascadingOptions(prev => ({
                    ...prev,
                    filteredSousVarietes
                }));
            } else {
                // Clear sous-varietes when no variety is selected
                setCascadingOptions(prev => ({
                    ...prev,
                    filteredSousVarietes: []
                }));
            }
        } else if (field === 'codsvar') {
            // Simple field update for sous-variety
            setFormData(prev => ({
                ...prev,
                codsvar: value
            }));
        }
    };

    const handleInputChange = (field, value) => {
        // Check if this is a cascading field
        if (field === 'numcul' || field === 'codvar' || field === 'codsvar') {
            handleCascadingChange(field, value);
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        // Clear reference error when user starts typing a new reference
        if (field === 'refpar') {
            setRefError('');
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            refpar: '',
            suppar: '',
            nbrarb: '',
            ecarte: '',
            espace: '',
            latitude: '',
            longitude: '',
            irriga: '',
            typefilet: '',
            dtepln: '',
            traite: 'NON',
            certif: 'NON',
            couverture: 'N',
            estimation: '',
            refver: '',
            numcul: '',
            codsvar: '',
            codvar: '',
        });
        setRefError('');
        setEditingParcelle(null);
        setOriginalRef(''); // ADDED
        setActiveTab('General');

        // Reset cascading options
        setCascadingOptions(prev => ({
            ...prev,
            filteredVarietes: [],
            filteredSousVarietes: []
        }));
    };

    // Handle edit parcelle - UPDATED LOGIC
    const handleEditParcelle = (parcelle) => {
        // Convert date format if needed - ADDED
        const formattedDate = parcelle.dtepln
            ? new Date(parcelle.dtepln).toISOString().split('T')[0]
            : '';

        const newFormData = {
            idparcelle: parcelle.idparcelle || '',
            refpar: parcelle.refpar?.toString() || '',
            suppar: parcelle.suppar?.toString() || '',
            nbrarb: parcelle.nbrarb?.toString() || '',
            ecarte: parcelle.ecarte?.toString() || '',
            espace: parcelle.espace?.toString() || '',
            latitude: parcelle.latitude || '',
            longitude: parcelle.longitude || '',
            irriga: parcelle.irriga || '',
            typefilet: parcelle.typefilet || '',
            dtepln: formattedDate, // UPDATED
            traite: parcelle.traite || 'NON',
            certif: parcelle.certif || 'NON',
            couverture: parcelle.couverture || 'N',
            estimation: parcelle.estimation?.toString() || '',
            refver: parcelle.refver?.toString() || '',
            numcul: parcelle.numcul?.toString() || '',
            codsvar: parcelle.codsvar?.toString() || '',
            codvar: parcelle.codvar?.toString() || '',
            refadh: parcelle.refadh || '' // ADDED
        };

        setFormData(newFormData);

        // Store original reference for duplicate checking - ADDED
        setOriginalRef(parcelle.refpar || '');

        // Handle cascading options for edit - UPDATED LOGIC
        if (parcelle.numcul && cascadingOptions.allVarietes.length > 0) {
            const filteredVarietes = cascadingOptions.allVarietes.filter(v =>
                v.codcul && Number(v.codcul) === Number(parcelle.numcul)
            );

            let filteredSousVarietes = [];
            if (parcelle.codvar && cascadingOptions.allSousVarietes.length > 0) {
                filteredSousVarietes = cascadingOptions.allSousVarietes.filter(sv =>
                    sv.codvar && Number(sv.codvar) === Number(parcelle.codvar)
                );
            }

            setCascadingOptions(prev => ({
                ...prev,
                filteredVarietes,
                filteredSousVarietes
            }));
        }

        setEditingParcelle(parcelle);
        setShowAddForm(true);
    };

    const validateForm = () => {
        // Field mapping with their user-friendly labels
        const fieldLabels = {
            refpar: 'Référence Parcelle',
            suppar: 'Superficie',
            nbrarb: 'Nombre d\'arbres',
            refver: 'Verger',
            numcul: 'Culture',
        };

        const required = ['refpar', 'suppar', 'nbrarb', 'refver', 'numcul'];
        const missing = required.filter(field => !formData[field] || !formData[field].toString().trim());

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
        if (formData.suppar && isNaN(parseFloat(formData.suppar))) {
            setSubmitMessage('La superficie doit être un nombre valide');
            return false;
        }

        if (formData.nbrarb && isNaN(parseInt(formData.nbrarb))) {
            setSubmitMessage('Le nombre d\'arbres doit être un nombre entier valide');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            // Prepare data for submission
            const submitData = {
                ...formData,
                suppar: formData.suppar ? parseFloat(formData.suppar) : null,
                nbrarb: formData.nbrarb ? parseInt(formData.nbrarb) : null,
                ecarte: formData.ecarte ? parseFloat(formData.ecarte) : null,
                espace: formData.espace ? parseFloat(formData.espace) : null,
                latitude: formData.latitude || null,
                longitude: formData.longitude || null,
                estimation: formData.estimation ? parseFloat(formData.estimation) : null,
                dtepln: formData.dtepln || null,
            };

            console.log('Submitting parcelle data:', submitData);
            console.log('editingParcelle data:', editingParcelle);

            let response;
            if (editingParcelle) {
                // Update existing parcelle
                response = await API.put(`/Parcelles/${editingParcelle.idparcelle}`, submitData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setSubmitMessage('Parcelle modifiée avec succès!');
            } else {
                // Create new parcelle
                response = await API.post('/Parcelles', submitData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setSubmitMessage('Parcelle ajoutée avec succès!');
            }

            if (response.status === 200 || response.status === 201 || response.status === 204) {
                // Reset form and close form
                resetForm();
                setShowAddForm(false);

                // Refresh parcelles list
                fetchParcelles();

                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                throw new Error('Erreur lors de l\'opération');
            }
        } catch (error) {
            console.error('Error submitting parcelle:', error);
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

    // Navigation functions
    const getCurrentTabIndex = () => {
        return tabs.findIndex(tab => tab.id === activeTab);
    };

    const canGoNext = () => {
        return getCurrentTabIndex() < tabs.length - 1;
    };

    const canGoPrevious = () => {
        return getCurrentTabIndex() > 0;
    };

    const handleNext = () => {
        const currentIndex = getCurrentTabIndex();
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        }
    };

    const handlePrevious = () => {
        const currentIndex = getCurrentTabIndex();
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
        }
    };

    // Get verger name by ID
    const getVergerName = (vergerId) => {
        const verger = vergers.find(v => v.refver === Number(vergerId));
        return verger ? `${verger.nomver} - ${verger.refver}` : `Verger ${vergerId}`;
    };

    // Get culture name by ID
    const getCultureName = (cultureId) => {
        const culture = cultures.find(c => c.codcul === Number(cultureId));
        return culture ? culture.nomcul : `Culture ${cultureId}`;
    };

    const NavigationButtons = () => (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
                onClick={handlePrevious}
                disabled={!canGoPrevious()}
                className="flex items-center space-x-2 text-gray-600 hover:text-black px-6 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={18} />
                <span>Retour</span>
            </button>

            <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
            >
                <span>Suivant</span>
                <ChevronLeft size={18} className="rotate-180" />
            </button>
        </div>
    );

    const handleDeleteParcelle = (parcelle) => {
        setParcelleToDelete(parcelle);
        setDeleteModalOpen(true);
    };

    // Add this new function to handle the actual deletion
    const confirmDeleteParcelle = async () => {
        if (!parcelleToDelete) return;

        setIsDeleting(true);
        setSubmitMessage('');

        try {
            await API.delete(`/Parcelles/${parcelleToDelete.idparcelle}`);
            setSubmitMessage('Parcelle supprimée avec succès!');
            fetchParcelles(); // Refresh the list
            setDeleteModalOpen(false);
            setParcelleToDelete(null);
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
            setParcelleToDelete(null);
        }
    };

    // Check if vergers are available
    const hasVergers = vergers.length > 0;

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des Parcelles</h3>
                <div className="flex space-x-2">
                    {!showAddForm && hasVergers && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            <Plus size={16} />
                            <span>Ajouter Parcelle</span>
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

            {/* Warning if no vergers available */}
            {!hasVergers && (
                <div className="mb-6 p-4 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <p className="font-medium">Aucun verger disponible</p>
                    <p className="text-sm mt-1">
                        Ce producteur n'a pas de vergers associés. Vous devez d'abord créer un verger avant d'ajouter une parcelle.
                    </p>
                </div>
            )}

            {/* Existing Parcelles List */}
            {!showAddForm && (
                <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Parcelles existantes</h4>

                    {parcellesLoading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Chargement des parcelles...</p>
                        </div>
                    ) : parcelles.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Aucune parcelle trouvée pour ce producteur.</p>
                            {hasVergers && (
                                <p className="text-sm text-gray-400 mt-1">Cliquez sur "Ajouter Parcelle" pour commencer.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {parcelles.map((parcelle, index) => (
                                <div key={parcelle.idparcelle || index} className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Référence:</span>
                                                    <p className="text-gray-900">{parcelle.refpar || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Verger:</span>
                                                    <p className="text-gray-900">{getVergerName(parcelle.refver)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Superficie:</span>
                                                    <p className="text-gray-900">{parcelle.suppar || 0} ha</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Nombre d'arbres:</span>
                                                    <p className="text-gray-900">{parcelle.nbrarb || 0}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Culture:</span>
                                                    <p className="text-gray-900">{getCultureName(parcelle.numcul)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Irrigation:</span>
                                                    <p className="text-gray-900">{parcelle.irriga || 'N/A'}</p>
                                                </div>
                                                {parcelle.latitude && parcelle.longitude && (
                                                    <div className="md:col-span-2">
                                                        <span className="text-sm font-medium text-gray-600">Coordonnées:</span>
                                                        <p className="text-gray-900">{parcelle.latitude}, {parcelle.longitude}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditParcelle(parcelle)}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteParcelle(parcelle)}
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
            {showAddForm && hasVergers && (
                <div className="mt-2">
                    <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900">
                            {editingParcelle ? 'Modifier la Parcelle' : 'Ajouter une Nouvelle Parcelle'}
                        </h4>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 rounded-xl p-1 mb-6 bg-gray-100 overflow-x-auto">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-black hover:bg-white'
                                        }`}
                                >
                                    <IconComponent size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* General Tab Content */}
                    {activeTab === 'General' && (
                        <div>
                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Informations Générales</h4>
                                <p className="text-gray-600 text-sm">Renseignez les informations de base de la parcelle</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* ID Parcelle - Only show when editing, read only */}
                                {editingParcelle && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ID Parcelle
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.idparcelle}
                                            readOnly
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            placeholder="ID de la parcelle"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">L'ID ne peut pas être modifié</p>
                                    </div>
                                )}

                                {/* Reference Parcelle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Référence Parcelle <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.refpar}
                                            onChange={(e) => handleInputChange('refpar', e.target.value)}
                                            onBlur={handleReferenceBlur}
                                            disabled={!!editingParcelle}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${refError
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-primary-500'
                                                } ${editingParcelle ? 'bg-gray-100' : ''}`}
                                            placeholder="Référence unique de la parcelle"
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
                                    {editingParcelle && (
                                        <p className="mt-1 text-xs text-gray-500">La référence ne peut pas être modifiée</p>
                                    )}
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
                                        value={formData.suppar}
                                        onChange={(e) => handleInputChange('suppar', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Nombre d'arbres */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre d'arbres <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.nbrarb}
                                        onChange={(e) => handleInputChange('nbrarb', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Nombre total d'arbres"
                                    />
                                </div>

                                {/* Estimation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimation (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.estimation}
                                        onChange={(e) => handleInputChange('estimation', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Estimation de production"
                                    />
                                </div>
                            </div>

                            <NavigationButtons />
                        </div>
                    )}

                    {/* Location Tab Content */}
                    {activeTab === 'Location' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Localisation</h2>
                                <p className="text-gray-600">Coordonnées et espacement de la parcelle</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Latitude */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Ex: 31.6295"
                                    />
                                </div>

                                {/* Longitude */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Ex: -7.9811"
                                    />
                                </div>

                                {/* Écartement */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Écartement (m)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.ecarte}
                                        onChange={(e) => handleInputChange('ecarte', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Écartement entre les rangées"
                                    />
                                </div>

                                {/* Espacement */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Espacement (m)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.espace}
                                        onChange={(e) => handleInputChange('espace', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Espacement entre les arbres"
                                    />
                                </div>
                            </div>

                            <NavigationButtons />
                        </div>
                    )}

                    {/* Cultivation Tab Content - WITH CASCADING DROPDOWNS */}
                    {activeTab === 'Cultivation' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Culture</h2>
                                <p className="text-gray-600">Informations sur la culture et les variétés</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Verger */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Verger <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.refver}
                                        onChange={(e) => handleInputChange('refver', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        disabled={optionsLoading}
                                    >
                                        <option value="">Sélectionner un verger</option>
                                        {vergers.map(verger => (
                                            <option key={verger.refver} value={verger.refver}>
                                                {verger.nomver || verger.refver}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Culture - CASCADE PARENT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Culture <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.numcul}
                                        onChange={(e) => handleInputChange('numcul', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        disabled={optionsLoading}
                                    >
                                        <option value="">Sélectionner une culture</option>
                                        {cultures.map(culture => (
                                            <option key={culture.codcul} value={culture.codcul}>
                                                {culture.nomcul || culture.codcul}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Variété - CASCADE CHILD OF CULTURE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Variété
                                    </label>
                                    <select
                                        value={formData.codvar}
                                        onChange={(e) => handleInputChange('codvar', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                        disabled={optionsLoading || !formData.numcul}
                                    >
                                        <option value="">
                                            {!formData.numcul ? 'Sélectionnez d\'abord une culture' : 'Sélectionner une variété'}
                                        </option>
                                        {cascadingOptions.filteredVarietes.map(variete => (
                                            <option key={variete.codvar} value={variete.codvar}>
                                                {variete.nomvar || variete.codvar}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.numcul && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Veuillez d'abord sélectionner une culture
                                        </p>
                                    )}
                                </div>

                                {/* Sous-Variété - CASCADE CHILD OF VARIÉTÉ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sous-Variété
                                    </label>
                                    <select
                                        value={formData.codsvar}
                                        onChange={(e) => handleInputChange('codsvar', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                        disabled={optionsLoading || !formData.codvar}
                                    >
                                        <option value="">
                                            {!formData.codvar ? 'Sélectionnez d\'abord une variété' : 'Sélectionner une sous-variété'}
                                        </option>
                                        {cascadingOptions.filteredSousVarietes.map(sousVariete => (
                                            <option key={sousVariete.codsvar} value={sousVariete.codsvar}>
                                                {sousVariete.nomsvar || sousVariete.codsvar}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.codvar && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Veuillez d'abord sélectionner une variété
                                        </p>
                                    )}
                                </div>

                                {/* Date de plantation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de plantation
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dtepln}
                                        onChange={(e) => handleInputChange('dtepln', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <NavigationButtons />
                        </div>
                    )}

                    {/* Technical Tab Content */}
                    {activeTab === 'Technical' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Informations Techniques</h2>
                                <p className="text-gray-600">Irrigation, traitement et autres paramètres techniques</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Irrigation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type d'irrigation
                                    </label>
                                    <select
                                        value={formData.irriga}
                                        onChange={(e) => handleInputChange('irriga', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">Sélectionner un type</option>
                                        <option value="Goutte à goutte">Goutte à goutte</option>
                                        <option value="Aspersion">Aspersion</option>
                                        <option value="Gravitaire">Gravitaire</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                {/* Type de filet */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de filet
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.typefilet}
                                        onChange={(e) => handleInputChange('typefilet', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Type de filet de protection"
                                    />
                                </div>

                                {/* Traitement */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Traitement
                                    </label>
                                    <select
                                        value={formData.traite}
                                        onChange={(e) => handleInputChange('traite', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="NON">Non traité</option>
                                        <option value="OUI">Traité</option>
                                    </select>
                                </div>

                                {/* Certification */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Certification
                                    </label>
                                    <select
                                        value={formData.certif}
                                        onChange={(e) => handleInputChange('certif', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="NON">Non certifié</option>
                                        <option value="OUI">Certifié</option>
                                    </select>
                                </div>

                                {/* Couverture */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couverture
                                    </label>
                                    <select
                                        value={formData.couverture}
                                        onChange={(e) => handleInputChange('couverture', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="N">Sans couverture</option>
                                        <option value="O">Avec couverture</option>
                                    </select>
                                </div>
                            </div>

                            {/* Action Buttons - Only show on the last tab */}
                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handlePrevious}
                                    disabled={!canGoPrevious()}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-black px-6 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                    <span>Retour</span>
                                </button>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || refError || optionsLoading || isCheckingRef}
                                        className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Save size={18} />
                                        <span>{isSubmitting ? 'Enregistrement...' : (editingParcelle ? 'Mettre à jour' : 'Enregistrer')}</span>
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
                        </div>
                    )}
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={confirmDeleteParcelle}
                title="Supprimer la parcelle"
                message="Êtes-vous sûr de vouloir supprimer la parcelle {itemName} ? Cette action est irréversible."
                itemName={parcelleToDelete?.refpar}
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={isDeleting}
                loadingText="Suppression en cours..."
                type="danger"
            />
        </div>
    );
};

export default AddProdParcelle;