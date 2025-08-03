import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import API from "../../../utils/Api";
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../../components/ui/Loader';

const AdherentDetail = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [adherent, setAdherent] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdherent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get(`/Adherents/${params.id}`);
      setAdherent(response.data);

    } catch (err) {
      setError({
        message: err.message || 'Erreur lors du chargement des données',
        status: err.response?.status
      });
      setLoading(false);
    } finally {
      setLoading(false)
    }
  };
  
  useEffect(() => {
    if (params.id) {
      fetchAdherent();
    }
  }, [params.id]);

  const handleBack = () => {
    navigate('/producteur')
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
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
                onClick={fetchAdherent}
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
            Producteurs
          </button>

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${getAvatarColor(adherent?.nomadh)} flex items-center justify-center text-white text-lg font-bold`}>
                {adherent?.nomadh?.substring(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{adherent?.nomadh || 'N/A'}</h1>
                  {adherent?.certif === 'OUI' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                      Certifié
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                      Non Certifié
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{adherent?.lier === '1' ? 'Actif' : 'Inactif'}</p>
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
              <div className="space-y-4 grid items-center sm:grid-cols-2 grid-cols-1 justify-between w-full">

                {/* Row 1 */}
                <div className="flex flex-wrap gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">CIN/IR</label>
                    <p className="text-gray-900 font-mono text-sm">{adherent?.cinadh || 'N/A'}</p>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Référence</label>
                    <p className="text-gray-900">#{adherent?.txtref || adherent?.refadh}</p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-wrap gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Nom Adhérent</label>
                    <p className="text-gray-900">{adherent?.nomadh || 'N/A'}</p>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Type</label>
                    <p className="text-gray-900">{adherent?.type || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex flex-wrap gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Téléphone</label>
                    <p className="text-gray-900">{adherent?.teladh || 'N/A'}</p>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Certification</label>
                    <p className="text-gray-900">{adherent?.certif === 'OUI' ? 'Certifié' : 'Non Certifié'}</p>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="flex flex-wrap gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Ville</label>
                    <p className="text-gray-900">{adherent?.viladh || 'N/A'}</p>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Date d'ajout</label>
                    <p className="text-gray-900">{formatDate(adherent?.dtadd)}</p>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="flex flex-wrap gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Nom Production</label>
                    <p className="text-gray-900">{adherent?.nompro || 'N/A'}</p>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-sm text-gray-500 mb-1">Statut Liaison</label>
                    <p className="text-gray-900">{adherent?.lier === '1' ? 'Actif' : 'Inactif'}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Phone number */}

            <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
              <div className="mb-6 space-y-2">
                <h4 className="font-medium text-gray-900 mb-3">Phone number</h4>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-900">
                      {adherent?.teladh}
                    </span>

                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {adherent.faxadh && <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-900">
                      {adherent.faxadh}
                    </span>

                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>}
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-white shadow-soft rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg mb-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Ville</label>
                    <p className="text-gray-900 font-medium">{adherent?.viladh || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Adresse complète</label>
                    <p className="text-gray-900">{adherent?.adradh || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdherentDetail;