import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw, MapPin, TreePine, Calendar, Settings, Info } from 'lucide-react';
import API from "../../../../utils/Api";
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../../../components/ui/Loader';

const ParcelleDetail = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [parcelle, setParcelle] = useState({});
  const [verger, setVerger] = useState({});
  const [culture, setCulture] = useState({});
  const [variete, setVariete] = useState({});
  const [sousVariete, setSousVariete] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParcelleDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch parcelle data
      const parcelleResponse = await API.get(`/Parcelles/${params.id}`);
      const parcelleData = parcelleResponse.data;
      setParcelle(parcelleData);

      // Fetch related data in parallel
      const promises = [];

      if (parcelleData.refver) {
        promises.push(
          API.get(`/Vergers/${parcelleData.refver}`)
            .then(res => setVerger(res.data))
            .catch(() => setVerger({}))
        );
      }

      if (parcelleData.numcul) {
        promises.push(
          API.get(`/Cultures/${parcelleData.numcul}`)
            .then(res => setCulture(res.data))
            .catch(() => setCulture({}))
        );
      }

      if (parcelleData.codvar) {
        promises.push(
          API.get(`/Varietes/${parcelleData.codvar}`)
            .then(res => setVariete(res.data))
            .catch(() => setVariete({}))
        );
      }

      if (parcelleData.codsvar) {
        promises.push(
          API.get(`/SousVarietes/${parcelleData.codsvar}`)
            .then(res => setSousVariete(res.data))
            .catch(() => setSousVariete({}))
        );
      }

      await Promise.all(promises);

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
      fetchParcelleDetails();
    }
  }, [params.id]);

  const handleBack = () => {
    navigate('/parcelle');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getParcelleColor = (ref) => {
    const colors = [
      'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
      'bg-teal-500', 'bg-indigo-500', 'bg-pink-500', 'bg-red-500'
    ];
    return colors[(ref?.charCodeAt(0) || 0) % colors.length];
  };

  const formatNumber = (number) => {
    if (!number) return 'N/A';
    return new Intl.NumberFormat('fr-FR').format(number);
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
                onClick={fetchParcelleDetails}
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
            Parcelles
          </button>

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${getParcelleColor(parcelle?.refpar)} flex items-center justify-center text-white text-lg font-bold`}>
                <TreePine className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{parcelle?.refpar || 'N/A'}</h1>
                  {parcelle?.certif === 'OUI' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                      Certifié
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      Non Certifié
                    </span>
                  )}
                  {parcelle?.traite === 'OUI' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                      Traité
                    </span>
                  )}
                </div>
                <p className="text-gray-600">ID: #{parcelle?.idparcelle}</p>
                <p className="text-sm text-gray-500">{culture?.nomcul || 'Culture non définie'}</p>
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
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Informations Générales</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">ID Parcelle</label>
                    <p className="text-gray-900 font-mono text-sm">#{parcelle?.idparcelle || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Référence</label>
                    <p className="text-gray-900 font-medium">{parcelle?.refpar || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Superficie</label>
                    <p className="text-gray-900">{parcelle?.suppar ? `${formatNumber(parcelle.suppar)} ha` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Nombre d'arbres</label>
                    <p className="text-gray-900">{formatNumber(parcelle?.nbrarb) || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Estimation</label>
                    <p className="text-gray-900">{parcelle?.estimation ? `${formatNumber(parcelle.estimation)} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Date de plantation</label>
                    <p className="text-gray-900">{formatDate(parcelle?.dtepln)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Localisation</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Latitude</label>
                    <p className="text-gray-900 font-mono text-sm">{parcelle?.latitude || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Longitude</label>
                    <p className="text-gray-900 font-mono text-sm">{parcelle?.longitude || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Écartement</label>
                    <p className="text-gray-900">{parcelle?.ecarte ? `${parcelle.ecarte} m` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Espacement</label>
                    <p className="text-gray-900">{parcelle?.espace ? `${parcelle.espace} m` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Information */}
            <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Informations Techniques</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Irrigation</label>
                    <p className="text-gray-900">{parcelle?.irriga || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Type de filet</label>
                    <p className="text-gray-900">{parcelle?.typefilet || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Traitement</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      parcelle?.traite === 'OUI' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {parcelle?.traite === 'OUI' ? 'Traité' : 'Non traité'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Certification</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      parcelle?.certif === 'OUI' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {parcelle?.certif === 'OUI' ? 'Certifié' : 'Non certifié'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Couverture</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      parcelle?.couverture === 'O' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {parcelle?.couverture === 'O' ? 'Avec couverture' : 'Sans couverture'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Culture Information */}
            <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TreePine className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Culture & Variétés</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Verger</label>
                      <p className="text-gray-900 font-medium">{verger?.nomver || verger?.refver || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Culture</label>
                      <p className="text-gray-900 font-medium">{culture?.nomcul || culture?.codcul || 'N/A'}</p>
                    </div>
                    {(variete?.nomvar || parcelle?.codvar) && (
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Variété</label>
                        <p className="text-gray-900">{variete?.nomvar || parcelle?.codvar || 'N/A'}</p>
                      </div>
                    )}
                    {(sousVariete?.nomsvar || parcelle?.codsvar) && (
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Sous-Variété</label>
                        <p className="text-gray-900">{sousVariete?.nomsvar || parcelle?.codsvar || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">{formatNumber(parcelle?.nbrarb) || '0'}</p>
                  <p className="text-sm text-gray-600">Arbres</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{parcelle?.suppar ? `${parcelle.suppar}` : '0'}</p>
                  <p className="text-sm text-gray-600">Hectares</p>
                </div>
                {parcelle?.estimation && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-2xl font-bold text-orange-600">{formatNumber(parcelle.estimation)}</p>
                    <p className="text-sm text-gray-600">kg (Estimation)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelleDetail;