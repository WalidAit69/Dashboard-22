import { useState, useEffect } from 'react';
import { Save, ArrowLeft, RefreshCw } from 'lucide-react';
import API from "../../../../utils/Api";
import Loader from '../../../../components/ui/Loader';

function AddDeclarationVerger() {
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

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      // Convert string values to numbers for the numeric fields
      const submitData = {
        refverReel: parseInt(formData.refverReel) || 0,
        refverNreel: parseInt(formData.refverNreel) || 0,
        codvar: parseInt(formData.codvar) || 0,
        refstat: formData.refstat
      };

      await API.post("/DeclarationVergers", submitData);
      
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        refverReel: '',
        refverNreel: '',
        codvar: '',
        refstat: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting declaration:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Failed to submit declaration',
        status: error.response?.status
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
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
              Nouvelle Déclaration Verger
            </h1>
          </div>
          <p className="text-gray-600">
            Créer une nouvelle déclaration de verger en remplissant les informations ci-dessous.
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
                <p className="text-sm text-green-700">La déclaration a été créée avec succès!</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
                placeholder="Entrer la référence status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDeclarationVerger;