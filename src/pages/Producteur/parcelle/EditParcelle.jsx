import { useEffect, useState } from 'react';
import { MapPin, TreePine, Settings, Info, Save, X, ChevronLeft } from 'lucide-react';
import API from '../../../utils/Api';
import { useNavigate, useParams } from 'react-router-dom';
import ProtocoleTab from './ProtocoleTab';

const EditParcelle = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isCheckingRef, setIsCheckingRef] = useState(false);
  const [refError, setRefError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const [Parcelle, setParcelle] = useState()

  // State for dropdown options
  const [vergers, setVergers] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // State for cascading dropdown options
  const [cascadingOptions, setCascadingOptions] = useState({
    allVarietes: [], // Store all varietes for filtering
    allSousVarietes: [], // Store all sous-varietes for filtering
    filteredVarietes: [], // Current filtered varietes
    filteredSousVarietes: [] // Current filtered sous-varietes
  });

  // Store original reference for checking duplicates
  const [originalRef, setOriginalRef] = useState('');

  const [formData, setFormData] = useState({
    idparcelle: '',
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
    { id: 'Protocole', label: 'Protocole', icon: Settings },
  ];

  // Fetch all dropdown options
  const fetchOptions = async () => {
    try {
      setOptionsLoading(true);

      const [vergersRes, culturesRes, varietesRes, sousVarietesRes] = await Promise.all([
        API.get("/Vergers"),
        API.get("/Cultures"),
        API.get("/Varietes"),
        API.get("/SousVarietes"),
      ]);

      setVergers(Array.isArray(vergersRes.data) ? vergersRes.data : []);
      setCultures(Array.isArray(culturesRes.data) ? culturesRes.data : []);

      // Store all varietes and sous-varietes for cascading filtering
      setCascadingOptions(prev => ({
        ...prev,
        allVarietes: Array.isArray(varietesRes.data) ? varietesRes.data : [],
        allSousVarietes: Array.isArray(sousVarietesRes.data) ? sousVarietesRes.data : [],
      }));
    } catch (error) {
      console.error('Error fetching options:', error);
      setSubmitMessage('Erreur lors du chargement des options');
    } finally {
      setOptionsLoading(false);
    }
  };

  // Initialize cascading filters based on existing data
  const initializeCascadingFilters = (parcelleData) => {
    const { numcul, codvar } = parcelleData;

    if (numcul && cascadingOptions.allVarietes.length > 0) {
      // Filter varietes by culture
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

  // Update cascading filters when options are loaded and form data is available
  useEffect(() => {
    if (cascadingOptions.allVarietes.length > 0 && formData.numcul) {
      initializeCascadingFilters(formData);
    }
  }, [cascadingOptions.allVarietes, cascadingOptions.allSousVarietes, formData.numcul, formData.codvar]);

  // Fetch existing parcelle data
  const fetchParcelleData = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(`/Parcelles/${id}`);

      if (response.data) {
        const parcelleData = response.data;

        // Convert date format if needed
        const formattedDate = parcelleData.dtepln
          ? new Date(parcelleData.dtepln).toISOString().split('T')[0]
          : '';

        const newFormData = {
          idparcelle: parcelleData.idparcelle || '',
          refpar: parcelleData.refpar || '',
          suppar: parcelleData.suppar || '',
          nbrarb: parcelleData.nbrarb || '',
          ecarte: parcelleData.ecarte || '',
          espace: parcelleData.espace || '',
          latitude: parcelleData.latitude || '',
          longitude: parcelleData.longitude || '',
          irriga: parcelleData.irriga || '',
          typefilet: parcelleData.typefilet || '',
          dtepln: formattedDate,
          traite: parcelleData.traite || 'NON',
          certif: parcelleData.certif || 'NON',
          couverture: parcelleData.couverture || 'N',
          estimation: parcelleData.estimation || '',
          refver: parcelleData.refver || '',
          numcul: parcelleData.numcul || '',
          codsvar: parcelleData.codsvar || '',
          codvar: parcelleData.codvar || '',
          refadh: parcelleData.refadh || ''
        };

        setParcelle(parcelleData)
        setFormData(newFormData);

        // Store original reference for duplicate checking
        setOriginalRef(parcelleData.refpar || '');
      }
    } catch (error) {
      console.error('Error fetching parcelle data:', error);
      setSubmitMessage('Erreur lors du chargement des données de la parcelle');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch options and parcelle data on component mount
  useEffect(() => {
    if (id) {
      Promise.all([fetchOptions(), fetchParcelleData()]);
    } else {
      navigate('/parcelle');
    }
  }, [id]);

  // Function to check if reference already exists (excluding current parcelle)
  const checkReferenceExists = async (refId) => {
    if (!refId || refId.trim() === '' || refId.trim() === originalRef) {
      setRefError('');
      return;
    }

    setIsCheckingRef(true);
    setRefError('');

    try {
      const response = await API.get(`/Parcelles`);
      const parcelles = Array.isArray(response.data) ? response.data : [];

      // Check if reference exists (excluding current parcelle)
      const existingParcelle = parcelles.find(p =>
        p.refpar &&
        p.refpar.toString() === refId.trim() &&
        p.idparcelle.toString() !== id.toString()
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

  // Handle cascading dropdown changes
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
        // Filter varietes by selected culture
        const filteredVarietes = cascadingOptions.allVarietes.filter(v =>
          v.numcul && Number(v.numcul) === Number(value)
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

  // Handle blur event for reference field
  const handleReferenceBlur = () => {
    const refValue = formData.refpar.trim();
    if (refValue) {
      checkReferenceExists(refValue);
    }
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
    const missing = required.filter(field => !formData[field].toString().trim());

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
        dtepln: formData.dtepln || null
      };

      console.log('Updating parcelle data:', submitData);

      // Send PUT request
      const response = await API.put(`/Parcelles/${id}`, submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 204) {
        setSubmitMessage('Parcelle mise à jour avec succès!');
        setTimeout(() => {
          navigate("/parcelle");
        }, 1500);
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating parcelle:', error);
      setSubmitMessage('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/parcelle");
  };

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

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between w-full space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Retour</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier Parcelle #{formData.idparcelle}
            </h1>
            <p className="text-gray-600">Référence: {formData.refpar}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
              >
                <IconComponent size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* General Tab Content */}
        {activeTab === 'General' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations Générales</h2>
              <p className="text-gray-600">Modifiez les informations de base de la parcelle</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Parcelle - Read only */}
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${refError
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    placeholder="Entrez la référence de la parcelle"
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
                  placeholder="Superficie en hectares"
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Localisation</h2>
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Culture</h2>
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations Techniques</h2>
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

            <NavigationButtons />

          </div>
        )}

        {/* Protocole Tab Content */}
        {activeTab === 'Protocole' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <ProtocoleTab id={id} parcelle={Parcelle} />

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
                  disabled={isSubmitting || refError || optionsLoading}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}</span>
                </button>
                <button
                  onClick={handleCancel}
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
    </div>
  );
};

export default EditParcelle;