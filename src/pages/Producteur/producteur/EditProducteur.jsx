import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, CreditCard, Bell, Link, Save, X, ChevronLeft } from 'lucide-react';
import API from '../../../utils/Api';
import Loader from '../../../components/ui/Loader';

const EditProducteur = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('Account');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [phoneError, setPhoneError] = useState('');

    const [formData, setFormData] = useState({
        refadh: '',
        nomadh: '',
        cinadh: '',
        adradh: '',
        viladh: '',
        teladh: '',
        faxadh: '',
        lier: "1",
        certif: '',
        type: '',
        nompro: '',
        txtref: '',
        dtadd: '',
    });

    const tabs = [
        { id: 'Account', label: 'Account', icon: User },
        { id: 'Security', label: 'Security', icon: Shield },
        { id: 'Billing & Plans', label: 'Billing & Plans', icon: CreditCard },
        { id: 'Notifications', label: 'Notifications', icon: Bell },
        { id: 'Connections', label: 'Connections', icon: Link }
    ];

    const typeOptions = [
        "Non Adherent",
        "Adherent",
        "Achat",
        "NON ADHERENT",
        "NON  ADHERENTS",
        "PRESTA",
        "Non adherent"
    ];

    const certifOptions = ['OUI', 'NON', 'Actif'];

    const fetchAdherent = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await API.get(`/Adherents/${params.id}`);
            const adherentData = response.data;

            // Update form data with fetched adherent data
            setFormData({
                refadh: adherentData.refadh || '',
                nomadh: adherentData.nomadh || '',
                cinadh: adherentData.cinadh || '',
                adradh: adherentData.adradh || '',
                viladh: adherentData.viladh || '',
                teladh: adherentData.teladh || '',
                faxadh: adherentData.faxadh || '',
                lier: adherentData.lier || "1",
                certif: adherentData.certif || '',
                type: adherentData.type || '',
                nompro: adherentData.nompro || '',
                txtref: adherentData.txtref || '',
                dtadd: adherentData.dtadd || '',
            });

        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des données',
                status: err.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchAdherent();
        }
    }, [params.id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear phone error when user starts typing a new phone number
        if (field === 'teladh') {
            setPhoneError('');
        }
    };

    // Function to validate phone number format
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^0\d{9}$/;
        return phoneRegex.test(phone);
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
            console.log(formData);

            // Send PUT request to update the adherent
            const response = await API.put(`/Adherents/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(response)

            if (response.status === 200 || response.status === 201 || response.status === 204) {
                setSubmitMessage('Adhérent modifié avec succès!');

                // Navigate back after 2 seconds
                setTimeout(() => {
                    navigate(-1); // Go back to previous page
                }, 2000);
            } else {
                throw new Error('Erreur lors de la modification');
            }
        } catch (error) {
            setSubmitMessage('Erreur: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            refadh: 0,
            nomadh: '',
            cinadh: '',
            adradh: '',
            viladh: '',
            teladh: '',
            faxadh: '',
            lier: '',
            certif: '',
            type: '',
            nompro: '',
            txtref: '',
        });
        setSubmitMessage('');
    };

    // Loading state
    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Loader />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                    <strong className="font-bold">Erreur!</strong>
                    <span className="block sm:inline"> {error.message}</span>
                    <div className="mt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Modifier l'Adhérent</h2>
                            <p className="text-gray-600">Modifiez les informations de l'adhérent</p>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Referance Adherent <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.refadh}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Entrez la référence de l'adhérent"
                                    />
                                </div>

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
                                    {typeOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Certification
                                </label>
                                <select
                                    value={formData.certif}
                                    onChange={(e) => handleInputChange('certif', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                >
                                    {certifOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || phoneError}
                                className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save size={18} />
                                <span>{isSubmitting ? 'Modification...' : 'Modifier'}</span>
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

export default EditProducteur;