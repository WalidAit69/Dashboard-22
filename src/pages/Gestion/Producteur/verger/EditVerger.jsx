import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, CreditCard, Bell, Link, Save, X, ChevronLeft } from 'lucide-react';
import API from '../../../../utils/Api';
import Loader from '../../../../components/ui/Loader';

const EditVerger = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('Account');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // State for options
    const [producteurOptions, setProducteurOptions] = useState([]);
    const [stationOptions, setStationOptions] = useState([]);
    const [producteurOptionsLoading, setProducteurOptionsLoading] = useState(false);
    const [stationOptionsLoading, setStationOptionsLoading] = useState(false);

    const [formData, setFormData] = useState({
        refver: '',
        refadh: '',
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
        certif: '',
        geoloc: '',
        blocker: '',
        Lier: '1',
    });

    const tabs = [
        { id: 'Account', label: 'Account', icon: User },
        { id: 'Security', label: 'Security', icon: Shield },
        { id: 'Billing & Plans', label: 'Billing & Plans', icon: CreditCard },
        { id: 'Notifications', label: 'Notifications', icon: Bell },
        { id: 'Connections', label: 'Connections', icon: Link }
    ];

    // Fetch producteur options
    const fetchProducteurOptions = async () => {
        try {
            setProducteurOptionsLoading(true);
            const res = await API.get("/Adherents");

            if (res.data && Array.isArray(res.data)) {
                setProducteurOptions(res.data);
            } else {
                setProducteurOptions([]);
            }
        } catch (error) {
            console.error('Error fetching producteur options:', error);
            setProducteurOptions([]);
        } finally {
            setProducteurOptionsLoading(false);
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

    // Fetch options on component mount
    useEffect(() => {
        fetchProducteurOptions();
        fetchStationOptions();
    }, []);

    const fetchVerger = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await API.get(`/Vergers/${params.id}`);
            const vergerData = response.data;

            console.log(vergerData);

            // Update form data with fetched verger data
            setFormData({
                refver: vergerData.refver || '',
                refadh: vergerData.refadh || '',
                refStation: vergerData.refStation || '1',
                nomver: vergerData.nomver || '',
                supver: vergerData.supver || '',
                region: vergerData.region || '',
                douar: vergerData.douar || '',
                locver: vergerData.locver || '',
                tecver: vergerData.tecver || '',
                disver: vergerData.disver || '',
                disverf: vergerData.disverf || '',
                coment: vergerData.coment || '',
                codggn: vergerData.codggn || '',
                certif: vergerData.certif || '',
                geoloc: vergerData.geoloc || '',
                blocker: vergerData.blocker || '',
                Lier: vergerData.Lier || '1',
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
            fetchVerger();
        }
    }, [params.id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        // Field mapping with their user-friendly labels
        const fieldLabels = {
            nomver: 'Libellé Verger',
            refadh: 'Producteur',
            refStation: 'Station',
            supver: 'Superficie',
            region: 'Région',
            douar: 'Adresse',
            locver: 'Localisation',
            tecver: 'Technicien'
        };

        const required = ['nomver', 'refadh', 'refStation', 'supver', 'region', 'douar', 'locver', 'tecver'];
        const missing = required.filter(field => !formData[field] || formData[field].toString().trim() === '');

        if (missing.length > 0) {
            const missingLabels = missing.map(field => fieldLabels[field]);
            setSubmitMessage(`Champs requis manquants: ${missingLabels.join(', ')}`);
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
                refver: parseInt(formData.refver),
                refadh: parseInt(formData.refadh),
                refStation: parseInt(formData.refStation),
                supver: parseFloat(formData.supver),
                disver: formData.disver ? parseFloat(formData.disver) : 0,
                disverf: formData.disverf ? parseFloat(formData.disverf) : 0,
            };

            // Send PUT request to update the verger
            const response = await API.put(`/Vergers/${params.id}`, submitData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201 || response.status === 204) {
                setSubmitMessage('Verger modifié avec succès!');

                navigate('/verger');
            } else {
                throw new Error('Erreur lors de la modification');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitMessage('Erreur: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/verger");
    };

    const handleToggleCertificationStatus = async () => {
        if (!isConfirmed) return;

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            // Toggle the certif value
            const newCertifValue = formData.certif === 'OUI' ? 'NON' : 'OUI';

            // Update form data
            const updatedFormData = {
                ...formData,
                certif: newCertifValue,
                refver: parseInt(formData.refver),
                refadh: parseInt(formData.refadh),
                refStation: parseInt(formData.refStation),
                supver: parseFloat(formData.supver),
                disver: formData.disver ? parseFloat(formData.disver) : 0,
                disverf: formData.disverf ? parseFloat(formData.disverf) : 0,
            };

            // Send PUT request to update the verger
            const response = await API.put(`/Vergers/${params.id}`, updatedFormData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201 || response.status === 204) {
                // Update local state
                setFormData(prev => ({
                    ...prev,
                    certif: newCertifValue
                }));

                setSubmitMessage(
                    newCertifValue === 'OUI'
                        ? 'Verger certifié avec succès!'
                        : 'Certification du verger retirée avec succès!'
                );

                // Reset confirmation checkbox
                setIsConfirmed(false);
                navigate('/verger');
            } else {
                throw new Error('Erreur lors de la modification du statut de certification');
            }
        } catch (error) {
            console.error('Certification toggle error:', error);
            setSubmitMessage('Erreur: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
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
                    <>
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Modifier le Verger</h2>
                                <p className="text-gray-600">Modifiez les informations du verger</p>
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
                                {/* Reference Verger */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Référence Verger <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.refver}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                        placeholder="Référence du verger"
                                    />
                                </div>

                                {/* Producteur */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Producteur <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.refadh}
                                        onChange={(e) => handleInputChange('refadh', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        disabled={producteurOptionsLoading}
                                    >
                                        <option value="">Sélectionner un producteur</option>
                                        {producteurOptions.map(producteur => (
                                            <option key={producteur.refadh} value={producteur.refadh}>
                                                {producteur.nomadh} - {producteur.refadh}
                                            </option>
                                        ))}
                                    </select>
                                    {producteurOptionsLoading && (
                                        <p className="mt-1 text-sm text-gray-500">Chargement des producteurs...</p>
                                    )}
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

                                {/* Actif O/N */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Actif O/N
                                    </label>
                                    <select
                                        value={formData.blocker}
                                        onChange={(e) => handleInputChange('blocker', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="N">Actif</option>
                                        <option value="O">Bloqué</option>
                                    </select>
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

                            {/* Action Buttons */}
                            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
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

                        {/* Certification Status Toggle Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                                {formData.certif === 'OUI' ? 'Désactiver le Compte' : 'Activer le Compte'}
                            </h1>

                            <div className={`border rounded-lg p-4 mb-6 ${formData.certif === 'OUI'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-green-50 border-green-200'
                                }`}>
                                <h2 className={`font-medium ${formData.certif === 'OUI' ? 'text-orange-800' : 'text-green-800'
                                    }`}>
                                    {formData.certif === 'OUI'
                                        ? 'Êtes-vous sûr de vouloir désactiver ce compte?'
                                        : 'Voulez-vous activer ce compte?'
                                    }
                                </h2>
                                <p className={`text-sm mt-2 ${formData.certif === 'OUI' ? 'text-orange-700' : 'text-green-700'
                                    }`}>
                                    {formData.certif === 'OUI'
                                        ? 'Cette action désactivera le compte du verger.'
                                        : 'Cette action activera le compte du verger.'
                                    }
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isConfirmed}
                                        onChange={(e) => setIsConfirmed(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2"
                                    />
                                    <span className="text-gray-700 text-sm">
                                        {formData.certif === 'OUI'
                                            ? 'Je confirme la désactivation du compte'
                                            : 'Je confirme l\'activation du compte'
                                        }
                                    </span>
                                </label>
                            </div>

                            <button
                                onClick={handleToggleCertificationStatus}
                                disabled={!isConfirmed}
                                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${isConfirmed
                                    ? formData.certif === 'OUI'
                                        ? 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                                        : 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                                    : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                {formData.certif === 'OUI' ? 'Désactiver le Compte' : 'Activer le Compte'}
                            </button>
                        </div>
                    </>
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

export default EditVerger;