import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import API from "../../../../utils/Api";
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../../../components/ui/Loader';

const VergerDetail = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [verger, setVerger] = useState({});
    const [producteur, setProducteur] = useState(null);
    const [station, setStation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVerger = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await API.get(`/Vergers/${params.id}`);
            const vergerData = response.data;
            setVerger(vergerData);

            // Fetch related producteur data
            if (vergerData.refadh) {
                try {
                    const producteurResponse = await API.get(`/Adherents/${vergerData.refadh}`);
                    setProducteur(producteurResponse.data);
                } catch (err) {
                    console.error('Error fetching producteur:', err);
                }
            }

            // Fetch related station data
            if (vergerData.refStation) {
                try {
                    const stationResponse = await API.get(`/Stations/${vergerData.refStation}`);
                    setStation(stationResponse.data);
                } catch (err) {
                    console.error('Error fetching station:', err);
                }
            }

        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des données',
                status: err.response?.status
            });
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchVerger();
        }
    }, [params.id]);

    const handleBack = () => {
        navigate('/gestion/verger');
    };

    const formatSuperficie = (superficie) => {
        if (!superficie || superficie === 0) return 'N/A';
        return `${superficie} ha`;
    };

    const formatDistance = (distance) => {
        if (!distance || distance === 0) return 'N/A';
        return `${distance} km`;
    };

    const getAvatarColor = (name) => {
        const colors = [
            'bg-primary-500', 'bg-secondary-500', 'bg-green-500', 'bg-red-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];
        return colors[(name?.charCodeAt(0) || 0) % colors.length];
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
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center max-w-md">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Erreur de chargement</h3>
                        <p className="text-gray-600 mb-6">{error.message}</p>
                        {error.status && (
                            <p className="text-sm text-gray-400 mb-6">Code d'erreur: {error.status}</p>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Retour
                            </button>
                            <button
                                onClick={fetchVerger}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-10 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Vergers
                    </button>

                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full ${getAvatarColor(verger?.nomver)} flex items-center justify-center text-white text-lg font-bold`}>
                                {verger?.nomver?.substring(0, 2).toUpperCase() || verger?.libelle?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{verger?.nomver || verger?.libelle || 'N/A'}</h1>
                                    {verger?.certif === 'OUI' ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                                            Certifié
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                                            Non Certifié
                                        </span>
                                    )}
                                    {verger?.blocker === 'N' ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                                            Actif
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                                            Bloqué
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600">{verger?.region || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du Verger</h3>
                            <div className="space-y-4 grid items-center sm:grid-cols-2 grid-cols-1 justify-between w-full">

                                {/* Row 1 */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Référence</label>
                                        <p className="text-gray-900 font-mono text-sm">#{verger?.refver || 'N/A'}</p>
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Libellé</label>
                                        <p className="text-gray-900">{verger?.nomver || verger?.libelle || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Superficie</label>
                                        <p className="text-gray-900">{formatSuperficie(verger?.supver)}</p>
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Région</label>
                                        <p className="text-gray-900">{verger?.region || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Localisation</label>
                                        <p className="text-gray-900">{verger?.locver || 'N/A'}</p>
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Technicien</label>
                                        <p className="text-gray-900">{verger?.tecver || verger?.technicien || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Row 4 */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Distance</label>
                                        <p className="text-gray-900">{formatDistance(verger?.disver)}</p>
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Distance F</label>
                                        <p className="text-gray-900">{formatDistance(verger?.disverf)}</p>
                                    </div>
                                </div>

                                {/* Row 5 */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Code GGN</label>
                                        <p className="text-gray-900">{verger?.codggn || 'N/A'}</p>
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Certification</label>
                                        <p className="text-gray-900">{verger?.certif === 'OUI' ? 'Certifié' : 'Non Certifié'}</p>
                                    </div>
                                </div>

                                {/* Row 6 */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">Statut</label>
                                        <p className="text-gray-900">{verger?.blocker === 'N' ? 'Actif' : 'Bloqué'}</p>
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label className="block text-sm text-gray-500 mb-1">GeoLocalisation</label>
                                        <p className="text-gray-900">{verger?.geoloc || 'N/A'}</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Remarks Section */}
                        {verger?.coment && (
                            <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Remarques</h3>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700">{verger.coment}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className='space-y-6'>
                        {/* Producteur Information */}
                        <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
                            <h4 className="font-medium text-gray-900 mb-3">Producteur</h4>
                            {producteur ? (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(producteur.nomadh)} flex items-center justify-center text-white text-sm font-medium`}>
                                                {producteur.nomadh?.substring(0, 2).toUpperCase() || '??'}
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-medium">{producteur.nomadh || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">Réf: {producteur.refadh}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">CIN/IR</label>
                                            <p className="text-gray-900">{producteur.cinadh || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Téléphone</label>
                                            <p className="text-gray-900">{producteur.teladh || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Type</label>
                                            <p className="text-gray-900">{producteur.type || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <p className="text-gray-500">Informations du producteur non disponibles</p>
                                </div>
                            )}
                        </div>

                        {/* Station Information */}
                        <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
                            <h4 className="font-medium text-gray-900 mb-3">Station</h4>
                            {station ? (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Nom de la Station</label>
                                            <p className="text-gray-900 font-medium">{station.nomsta || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Référence</label>
                                            <p className="text-gray-900">#{station.refsta}</p>
                                        </div>
                                        {station.adresse && (
                                            <div>
                                                <label className="block text-sm text-gray-500 mb-1">Adresse</label>
                                                <p className="text-gray-900">{station.adresse}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <p className="text-gray-500">Informations de la station non disponibles</p>
                                </div>
                            )}
                        </div>

                        {/* Adresse */}
                        <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Localisation</h3>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg mb-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-500 mb-1">Région</label>
                                        <p className="text-gray-900 font-medium">{verger?.region || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-500 mb-1">Adresse</label>
                                        <p className="text-gray-900">{verger?.adress || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-500 mb-1">Localisation précise</label>
                                        <p className="text-gray-900">{verger?.locver || 'N/A'}</p>
                                    </div>
                                    {verger?.douar && (
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Douar</label>
                                            <p className="text-gray-900">{verger.douar}</p>
                                        </div>
                                    )}
                                    {verger?.geoloc && verger.geoloc !== '0' && (
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Coordonnées GPS</label>
                                            <p className="text-gray-900 font-mono text-sm">{verger.geoloc}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VergerDetail;