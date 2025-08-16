import { useState, useEffect } from 'react';
import { Save, ArrowLeft, RefreshCw } from 'lucide-react';
import API from "../../../../utils/Api";
import Loader from '../../../../components/ui/Loader';
import { useNavigate, useParams } from 'react-router-dom';

function EditDeclarationVerger() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    refverReel: '',
    refverNreel: '',
    codvar: '',
    refstat: ''
  });

  const [dropdownData, setDropdownData] = useState({
    vergers: [],
    varietes: []
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch dropdown data and declaration data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [vergersRes, varietesRes, declarationRes] = await Promise.all([
        API.get("/Vergers"),
        API.get("/Varietes"),
        API.get(`/DeclarationVergers/${id}`)
      ]);

      setDropdownData({
        vergers: Array.isArray(vergersRes.data) ? vergersRes.data : [],
        varietes: Array.isArray(varietesRes.data) ? varietesRes.data : []
      });

      // Pre-populate form with existing declaration data
      const declaration = declarationRes.data;
      if (declaration) {
        setFormData({
          refverReel: declaration.refverReel?.toString() || '',
          refverNreel: declaration.refverNreel?.toString() || '',
          codvar: declaration.codvar?.toString() || '',
          refstat: declaration.refstat || ''
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Failed to fetch data',
        status: error.response?.status
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch only dropdown data (for retry)
  const fetchDropdownData = async () => {
    try {
      setError(null);

      const [vergersRes, varietesRes] = await Promise.all([
        API.get("/Vergers"),
        API.get("/Varietes")
      ]);

      setDropdownData({
        vergers: Array.isArray(vergersRes.data) ? vergersRes.data : [],
        varietes: Array.isArray(varietesRes.data) ? varietesRes.data : []
      });

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Failed to fetch dropdown data',
        status: error.response?.status
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setError({ message: 'ID de déclaration manquant' });
      setInitialLoading(false);
    }
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear success message when user starts typing
    if (success) {
      setSuccess(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Convert string values to numbers for the numeric fields
      const submitData = {
        id,
        refverReel: parseInt(formData.refverReel) || 0,
        refverNreel: parseInt(formData.refverNreel) || 0,
        codvar: parseInt(formData.codvar) || 0,
        refstat: formData.refstat
      };

      await API.put(`/DeclarationVergers/${id}`, submitData);

      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        navigate('/declaration-verger');
      }, 1000);

    } catch (error) {
      console.error('Error updating declaration:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Failed to update declaration',
        status: error.response?.status
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show initial loading state
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Show error state for critical errors (like missing ID)
  if (error && !dropdownData.vergers.length && !dropdownData.varietes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500 mb-4">{error.message}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier Déclaration Verger
            </h1>
          </div>
          <p className="text-gray-600">
            Modifier les informations de la déclaration #{id}.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-red-400 mr-3 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
                <button
                  onClick={fetchDropdownData}
                  className="mt-2 text-sm text-red-800 hover:text-red-900 underline flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-green-400 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Succès</h3>
                <p className="text-sm text-green-700">La déclaration a été mise à jour avec succès!</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informations de la déclaration</h2>
          </div>

          <div className="p-6 space-y-6">
            {loading && (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            )}

            {/* Verger Réel */}
            <div>
              <label htmlFor="refverReel" className="block text-sm font-medium text-gray-700 mb-2">
                Verger Réel *
              </label>
              <select
                id="refverReel"
                name="refverReel"
                value={formData.refverReel}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner un verger</option>
                {dropdownData.vergers.map((verger) => (
                  <option key={verger.refver} value={verger.refver}>
                    {verger.nomver}
                  </option>
                ))}
              </select>
            </div>

            {/* Verger Non-Réel */}
            <div>
              <label htmlFor="refverNreel" className="block text-sm font-medium text-gray-700 mb-2">
                Verger Non-Réel *
              </label>
              <select
                id="refverNreel"
                name="refverNreel"
                value={formData.refverNreel}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner un verger</option>
                {dropdownData.vergers.map((verger) => (
                  <option key={verger.refver} value={verger.refver}>
                    {verger.nomver}
                  </option>
                ))}
              </select>
            </div>

            {/* Variété */}
            <div>
              <label htmlFor="codvar" className="block text-sm font-medium text-gray-700 mb-2">
                Variété *
              </label>
              <select
                id="codvar"
                name="codvar"
                value={formData.codvar}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner une variété</option>
                {dropdownData.varietes.map((variete) => (
                  <option key={variete.codvar} value={variete.codvar}>
                    {variete.nomvar}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference Status */}
            <div>
              <label htmlFor="refstat" className="block text-sm font-medium text-gray-700 mb-2">
                Référence Status *
              </label>
              <input
                type="text"
                id="refstat"
                name="refstat"
                value={formData.refstat}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Entrer la référence status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {submitting ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditDeclarationVerger;