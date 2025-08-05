import { useEffect, useState } from 'react';
import { User, MapPin, TreePine, Settings, Info, Save, X, ChevronLeft } from 'lucide-react';
import API from '../../../utils/Api';
import { useNavigate } from 'react-router-dom';

const AddParcelle = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isCheckingRef, setIsCheckingRef] = useState(false);
  const [refError, setRefError] = useState('');
  const navigate = useNavigate();

  // State for dropdown options
  const [vergers, setVergers] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [sousVarietes, setSousVarietes] = useState([]);
  const [varietes, setVarietes] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

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

  // Fetch all dropdown options
  const fetchOptions = async () => {
    try {
      setOptionsLoading(true);

      const [vergersRes, culturesRes, sousVarietesRes, varietesRes] = await Promise.all([
        API.get("/Vergers"),
        API.get("/Cultures"),
        API.get("/SousVarietes"),
        API.get("/Varietes"),
      ]);

      setVergers(Array.isArray(vergersRes.data) ? vergersRes.data : []);
      setCultures(Array.isArray(culturesRes.data) ? culturesRes.data : []);
      setSousVarietes(Array.isArray(sousVarietesRes.data) ? sousVarietesRes.data : []);
      setVarietes(Array.isArray(varietesRes.data) ? varietesRes.data : []);
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setOptionsLoading(false);
    }
  };

  // Fetch options on component mount
  useEffect(() => {
    fetchOptions();
  }, []);

  // Function to check if reference already exists
  const checkReferenceExists = async (refId) => {
    if (!refId || refId.trim() === '') {
      setRefError('');
      return;
    }

    setIsCheckingRef(true);
    setRefError('');

    try {
      const response = await API.get(`/Parcelles`);
      const parcelles = Array.isArray(response.data) ? response.data : [];

      // Check if reference exists
      const existingParcelle = parcelles.find(p => p.idparcelle.toString() === refId.trim());

      if (existingParcelle) {
        setRefError('ID est déjà utilisée');
      }
    } catch (err) {
      console.error('Error checking reference:', err);
      setRefError('Erreur lors de la vérification de la référence');
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
    if (field === 'refpar') {
      setRefError('');
    }
  };

  // Handle blur event for reference field
  const handleReferenceBlur = () => {
    const refValue = formData.idparcelle.trim();
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

      console.log('Submitting parcelle data:', submitData);

      // Send POST request
      const response = await API.post('/Parcelles', submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitMessage('Parcelle ajoutée avec succès!');
        setTimeout(() => {
          navigate("/parcelle");
        }, 1500);
      } else {
        throw new Error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Error submitting parcelle:', error);
      setSubmitMessage('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/parcelle");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with back button */}
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Retour</span>
          </button>
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
              <p className="text-gray-600">Renseignez les informations de base de la parcelle</p>
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
              {/* ID Parcelle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Parcelle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formData.idparcelle}
                    onChange={(e) => handleInputChange('idparcelle', e.target.value)}
                    onBlur={handleReferenceBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="ID numérique de la parcelle"
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

              {/* Reference Parcelle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence Parcelle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.refpar}
                  onChange={(e) => handleInputChange('refpar', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all border-gray-300 focus:ring-primary-500`}
                  placeholder="Entrez la référence de la parcelle"
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
          </div>
        )}

        {/* Cultivation Tab Content */}
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

              {/* Culture */}
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

              {/* Variété */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variété
                </label>
                <select
                  value={formData.codvar}
                  onChange={(e) => handleInputChange('codvar', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  disabled={optionsLoading}
                >
                  <option value="">Sélectionner une variété</option>
                  {varietes.map(variete => (
                    <option key={variete.codvar} value={variete.codvar}>
                      {variete.nomvar || variete.codvar}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sous-Variété */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-Variété
                </label>
                <select
                  value={formData.codsvar}
                  onChange={(e) => handleInputChange('codsvar', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  disabled={optionsLoading}
                >
                  <option value="">Sélectionner une sous-variété</option>
                  {sousVarietes.map(sousVariete => (
                    <option key={sousVariete.codsvar} value={sousVariete.codsvar}>
                      {sousVariete.nomsvar || sousVariete.codsvar}
                    </option>
                  ))}
                </select>
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

            {/* Action Buttons - Only show on the last tab */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || refError || optionsLoading}
                className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={18} />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
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
        )}
      </div>
    </div>
  );
};

export default AddParcelle;