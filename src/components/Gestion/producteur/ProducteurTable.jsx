import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Download, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Search, AlertCircle, Pen } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from "../../../utils/Api";
import Loader from '../../ui/Loader';
import ConfirmationModal from './ConfirmationModal';

const ProducteurTable = ({ initialData = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [certifFilter, setCertifFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // State for data management
  const [adherents, setAdherents] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // State for type options
  const [typeOptions, setTypeOptions] = useState([]);
  const [typeOptionsLoading, setTypeOptionsLoading] = useState(false);

  // State for delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    adherent: null,
    loading: false
  });

  // Update adherents when initialData changes
  useEffect(() => {
    setAdherents(initialData);
  }, [initialData]);

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

  const GetData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const res = await API.get("/Adherents");

      // Assuming the API returns an array of adherents
      if (res.data && Array.isArray(res.data)) {
        setAdherents(res.data);
        // Call onRefresh if provided to update parent component
        if (onRefresh) {
          onRefresh();
        }
      } else {
        // Handle case where data structure is different
        setAdherents(res.data ? [res.data] : []);
      }

      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching adherents:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Failed to fetch data',
        status: error.response?.status,
        canRetry: error.response?.status !== 404
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Delete adherent function
  const handleDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      await API.delete(`/Adherents/${deleteModal.adherent.refadh}`);

      // Remove from local state
      setAdherents(prev => prev.filter(item => item.refadh !== deleteModal.adherent.refadh));

      // Close modal
      setDeleteModal({ isOpen: false, adherent: null, loading: false });

      // Call onRefresh if provided to update parent component analytics
      if (onRefresh) {
        onRefresh();
      }

      // Optional: Show success message
      // You can add a toast notification here

    } catch (error) {
      console.error('Error deleting adherent:', error);
      setDeleteModal(prev => ({ ...prev, loading: false }));

      // Optional: Show error message
      // You can add error handling/toast here
    }
  };

  // Open delete modal
  const openDeleteModal = (adherent) => {
    setDeleteModal({
      isOpen: true,
      adherent: adherent,
      loading: false
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({
        isOpen: false,
        adherent: null,
        loading: false
      });
    }
  };

  // Retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    GetData();
  };

  // Auto-refresh function
  const handleRefresh = () => {
    GetData(false); // Refresh without showing full loading state
  };

  // Only fetch data if no initial data is provided
  useEffect(() => {
    if (!initialData.length) {
      GetData();
    }
  }, [initialData.length]);

  // Filter and search logic
  const filteredAdherents = useMemo(() => {
    if (!adherents.length) return [];

    return adherents.filter(adherent => {
      const matchesSearch =
        (adherent.nomadh?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (adherent.nompro?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (adherent.cinadh?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (adherent.viladh?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (adherent.teladh?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

      const matchesCertif = !certifFilter || adherent.certif === certifFilter;
      const matchesType = !typeFilter || adherent.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesCertif && matchesType;
    });
  }, [adherents, searchTerm, certifFilter, typeFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAdherents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdherents = filteredAdherents.slice(startIndex, startIndex + itemsPerPage);

  const certifOptions = ['OUI', 'NON'];

  const getCertifBadge = (certif) => {
    const certifStyles = {
      'OUI': 'bg-green-100 text-green-800',
      'NON': 'bg-red-100 text-red-800',
    };
    return certifStyles[certif] || 'bg-gray-100 text-gray-800';
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-primary-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // Loading state - only show if we're loading and don't have initial data
  if (loading && !adherents.length) {
    return (
      <Loader />
    );
  }

  // Error state
  if (error && !adherents.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500 mb-4">{error.message}</p>
          {error.status && (
            <p className="text-sm text-gray-400 mb-4">Code d'erreur: {error.status}</p>
          )}
          {error.canRetry && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? 'Trop de tentatives' : 'Réessayer'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Certification Filter */}
            <div className="relative">
              <select
                value={certifFilter}
                onChange={(e) => setCertifFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Toutes les certifications</option>
                {certifOptions.map(certif => (
                  <option key={certif} value={certif}>{certif}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                disabled={typeOptionsLoading}
              >
                <option value="">Tous les types</option>
                {typeOptions.map(typeOption => (
                  <option key={typeOption.libelle} value={typeOption.libelle}>
                    {typeOption.libelle}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              {typeOptionsLoading && (
                <div className="absolute right-8 top-3">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-10"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un producteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
                <Link to={"/gestion/producteur/add"} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nouveau Producteur
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCTEUR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN/IR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VILLE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONTACT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIVE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAdherents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {filteredAdherents.length === 0 && adherents.length > 0
                      ? "Aucun résultat trouvé pour votre recherche"
                      : "Aucun producteur trouvé"}
                  </td>
                </tr>
              ) : (
                paginatedAdherents.map((adherent) => (
                  <tr key={adherent.refadh} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(adherent.nomadh)} flex items-center justify-center text-white text-sm font-medium mr-3`}>
                          {adherent.nomadh?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{adherent.nomadh || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{adherent.nompro || 'N/A'}</div>
                          <div className="text-xs text-gray-400">Réf: {adherent.refadh}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {adherent.cinadh || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{adherent.viladh || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{adherent.adradh || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{adherent.teladh || 'N/A'}</div>
                      {adherent.faxadh && (
                        <div className="text-sm text-gray-500">Fax: {adherent.faxadh}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCertifBadge(adherent.certif)}`}>
                        {adherent.certif || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {adherent.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/gestion/producteur/${adherent.refadh}`}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(adherent)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/gestion/producteur/edit/${adherent.refadh}`}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Modifier"
                        >
                          <Pen className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500">
              Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredAdherents.length)} sur {filteredAdherents.length} entrées
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer le producteur {itemName} ? Cette action est irréversible."
        itemName={deleteModal.adherent?.nomadh}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleteModal.loading}
        loadingText="Suppression..."
        type="danger"
      />
    </>
  );
};

export default ProducteurTable;