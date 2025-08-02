import { useEffect, useState } from 'react';
import { User, Shield, CreditCard, Bell, Link, Save, X, ChevronLeft } from 'lucide-react';
import API from '../../../utils/Api';
import { useNavigate } from 'react-router-dom';

const AddProducteur = () => {
  const [activeTab, setActiveTab] = useState('Account');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isCheckingRef, setIsCheckingRef] = useState(false);
  const [refError, setRefError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  // State for type options
  const [typeOptions, setTypeOptions] = useState([]);
  const [typeOptionsLoading, setTypeOptionsLoading] = useState(false);

  const [formData, setFormData] = useState({
    refadh: '',
    nomadh: '',
    cinadh: '',
    adradh: '',
    viladh: '',
    teladh: '',
    faxadh: '',
    lier: "1",
    certif: 'OUI',
    type: '',
    nompro: '',
    txtref: '',
    dtadd: new Date().toISOString().split('T')[0], // Current date
  });

  const tabs = [
    { id: 'Account', label: 'Account', icon: User },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Billing & Plans', label: 'Billing & Plans', icon: CreditCard },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Connections', label: 'Connections', icon: Link }
  ];

  // Fetch type options
  const fetchTypeOptions = async () => {
    try {
      setTypeOptionsLoading(true);
      const res = await API.get("/TypeAdherents");

      if (res.data && Array.isArray(res.data)) {
        setTypeOptions(res.data);
      } else {
        setTypeOptions([]);
      }
    } catch (error) {
      console.error('Error fetching type options:', error);
      // Fallback to empty array on error
      setTypeOptions([]);
    } finally {
      setTypeOptionsLoading(false);
    }
  };

  // Fetch type options on component mount
  useEffect(() => {
    fetchTypeOptions();
  }, []);

  // Function to validate phone number format
  const validatePhoneNumber = (phone) => {
    // Check if phone matches the format: starts with 0, followed by 9 digits (total 10 digits)
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Function to check if reference already exists
  const checkReferenceExists = async (refId) => {
    if (!refId || refId.trim() === '') {
      setRefError('');
      return;
    }

    setIsCheckingRef(true);
    setRefError('');

    try {
      const response = await API.get(`/Adherents/${refId}`);

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
    if (field === 'refadh') {
      setRefError('');
    }

    // Clear phone error when user starts typing a new phone number
    if (field === 'teladh') {
      setPhoneError('');
    }
  };

  // Handle blur event for reference field
  const handleReferenceBlur = () => {
    const refValue = formData.refadh.trim();
    if (refValue) {
      checkReferenceExists(refValue);
    }
  };

  // Handle blur event for phone field
  const handlePhoneBlur = () => {
    const phoneValue = formData.teladh.trim();
    if (phoneValue && !validatePhoneNumber(phoneValue)) {
      setPhoneError('Le numéro de téléphone doit commencer par 0 et contenir exactement 10 chiffres (ex: 0642971877)');
    } else {
      setPhoneError('');
    }
  };

  const validateForm = () => {
    // Field mapping with their user-friendly labels
    const fieldLabels = {
      nomadh: 'Nom Producteur',
      cinadh: 'CIN OU IR',
      adradh: 'Adresse',
      viladh: 'Ville / Province',
      teladh: 'Téléphone',
      type: 'Type',
      nompro: 'Nom Décompte'
    };

    const required = ['nomadh', 'cinadh', 'adradh', 'viladh', 'teladh', 'type', 'nompro'];
    const missing = required.filter(field => !formData[field].trim());

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

    // Check if phone has an error
    if (phoneError) {
      setSubmitMessage('Veuillez corriger le format du numéro de téléphone avant de continuer');
      return false;
    }

    // Validate phone number format if phone is provided
    if (formData.teladh.trim() && !validatePhoneNumber(formData.teladh.trim())) {
      setPhoneError('Le numéro de téléphone doit commencer par 0 et contenir exactement 10 chiffres (ex: 0642971877)');
      setSubmitMessage('Veuillez corriger le format du numéro de téléphone avant de continuer');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      console.log(formData)

      // Send POST request using axios
      const response = await API.post('/Adherents', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitMessage('Adhérent ajouté avec succès!');

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            refadh: '',
            nomadh: '',
            cinadh: '',
            adradh: '',
            viladh: '',
            teladh: '',
            faxadh: '',
            lier: "1",
            certif: 'OUI',
            type: '',
            nompro: '',
            txtref: '',
            dtadd: new Date().toISOString().split('T')[0], // Current date
          });
          setSubmitMessage('');
          setRefError('');
        }, 3000);
      } else {
        throw new Error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      setSubmitMessage('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/producteur")
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
        <div className="flex space-x-1 rounded-xl p-1 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
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

        {/* Account Tab Content */}
        {activeTab === 'Account' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ajouter un Adhérent</h2>
              <p className="text-gray-600">Remplissez les informations de l'adhérent</p>
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

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference Adherent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referance Adherent <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={formData.refadh}
                    onChange={(e) => handleInputChange('refadh', e.target.value)}
                    onBlur={handleReferenceBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${refError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    placeholder="Entrez la référence de l'adhérent"
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

              {/* Nom Producteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Producteur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nomadh}
                  onChange={(e) => handleInputChange('nomadh', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Entrez le nom du producteur"
                />
              </div>

              {/* CIN OU IR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIN OU IR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cinadh}
                  onChange={(e) => handleInputChange('cinadh', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="CIN ou numéro IR"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.adradh}
                  onChange={(e) => handleInputChange('adradh', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Adresse complète"
                />
              </div>

              {/* Ville / Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville / Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.viladh}
                  onChange={(e) => handleInputChange('viladh', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ville ou province"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.teladh}
                    onChange={(e) => handleInputChange('teladh', e.target.value)}
                    onBlur={handlePhoneBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${phoneError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    placeholder="0642971877"
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
              </div>

              {/* Fax */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fax
                </label>
                <input
                  type="text"
                  value={formData.faxadh}
                  onChange={(e) => handleInputChange('faxadh', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Numéro de fax (optionnel)"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Sélectionner un type</option>
                  {typeOptions.map(typeOption => (
                    <option key={typeOption.libelle} value={typeOption.libelle}>
                      {typeOption.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nom Décompte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Décompte <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nompro}
                  onChange={(e) => handleInputChange('nompro', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nom pour le décompte"
                />
              </div>

              {/* Certification */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification
                </label>
                <select
                  value={formData.certif}
                  onChange={(e) => handleInputChange('certif', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Sélectionner une certification</option>
                  {certifOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div> */}

            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || refError || phoneError}
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

        {/* Other Tab Placeholders */}
        {activeTab !== 'Account' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab} Settings
              </h3>
              <p className="text-gray-600">
                Cette section sera bientôt disponible. Cliquez sur Account pour voir le formulaire principal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProducteur;