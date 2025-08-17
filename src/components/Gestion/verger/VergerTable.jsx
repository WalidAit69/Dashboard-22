import { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  Download,
  Plus,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Pen,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../../../utils/Api";
import Loader from "../../ui/Loader";
import ConfirmationModal from "../producteur/ConfirmationModal";

const VergerTable = ({ initialData = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certifFilter, setCertifFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [blockerFilter, setBlockerFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // State for data management
  const [vergers, setVergers] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // State for delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    verger: null,
    loading: false,
  });

  // Update vergers when initialData changes
  useEffect(() => {
    setVergers(initialData);
  }, [initialData]);

  const GetData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const res = await API.get("/Vergers");

      // Assuming the API returns an array of vergers
      if (res.data && Array.isArray(res.data)) {
        setVergers(res.data);
        // Call onRefresh if provided to update parent component
        if (onRefresh) {
          onRefresh();
        }
      } else {
        // Handle case where data structure is different
        setVergers(res.data ? [res.data] : []);
      }

      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error fetching vergers:", error);
      setError({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch data",
        status: error.response?.status,
        canRetry: error.response?.status !== 404,
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Delete verger function
  const handleDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      await API.delete(`/Vergers/${deleteModal.verger.refver}`);

      // Remove from local state
      setVergers((prev) =>
        prev.filter((item) => item.refver !== deleteModal.verger.refver)
      );

      // Close modal
      setDeleteModal({ isOpen: false, verger: null, loading: false });

      // Call onRefresh if provided to update parent component analytics
      if (onRefresh) {
        onRefresh();
      }

      // Optional: Show success message
      // You can add a toast notification here
    } catch (error) {
      console.error("Error deleting verger:", error);
      setDeleteModal((prev) => ({ ...prev, loading: false }));

      // Optional: Show error message
      // You can add error handling/toast here
    }
  };

  // Open delete modal
  const openDeleteModal = (verger) => {
    setDeleteModal({
      isOpen: true,
      verger: verger,
      loading: false,
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({
        isOpen: false,
        verger: null,
        loading: false,
      });
    }
  };

  // Retry function
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
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
  const filteredVergers = useMemo(() => {
    if (!vergers.length) return [];

    return vergers.filter((verger) => {
      const matchesSearch =
        verger.nomver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "" ||
        verger.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "" ||
        verger.douar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "" ||
        verger.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "" ||
        verger.locver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "" ||
        verger.technicien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "" ||
        verger.refver?.toString().includes(searchTerm) ||
        "";

      const matchesCertif = !certifFilter || verger.certif === certifFilter;
      const matchesRegion =
        !regionFilter ||
        verger.region?.toLowerCase().includes(regionFilter.toLowerCase());
      const matchesBlocker = !blockerFilter || verger.blocker === blockerFilter;

      return matchesSearch && matchesCertif && matchesRegion && matchesBlocker;
    });
  }, [vergers, searchTerm, certifFilter, regionFilter, blockerFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredVergers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVergers = filteredVergers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const certifOptions = ["OUI", "NON"];

  // Get unique regions from data
  const regionOptions = useMemo(() => {
    const regions = [...new Set(vergers.map((v) => v.region).filter(Boolean))];
    return regions.sort();
  }, [vergers]);

  const getCertifBadge = (certif) => {
    const certifStyles = {
      OUI: "bg-green-100 text-green-800",
      NON: "bg-red-100 text-red-800",
    };
    return certifStyles[certif] || "bg-gray-100 text-gray-800";
  };

  const getBlockerBadge = (blocker) => {
    const blockerStyles = {
      O: "bg-red-100 text-red-800",
      N: "bg-green-100 text-green-800",
    };
    return blockerStyles[blocker] || "bg-gray-100 text-gray-800";
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-primary-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const formatSuperficie = (superficie) => {
    if (!superficie || superficie === 0) return "N/A";
    return `${superficie} ha`;
  };

  // Loading state - only show if we're loading and don't have initial data
  if (loading && !vergers.length) {
    return <Loader />;
  }

  // Error state
  if (error && !vergers.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-500 mb-4">{error.message}</p>
          {error.status && (
            <p className="text-sm text-gray-400 mb-4">
              Code d'erreur: {error.status}
            </p>
          )}
          {error.canRetry && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? "Trop de tentatives" : "Réessayer"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Certification Filter */}
            <div className="relative">
              <select
                value={certifFilter}
                onChange={(e) => setCertifFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Toutes les certifications</option>
                {certifOptions.map((certif) => (
                  <option key={certif} value={certif}>
                    {certif}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Region Filter */}
            <div className="relative">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Toutes les régions</option>
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Blocker Filter */}
            <div className="relative">
              <select
                value={blockerFilter}
                onChange={(e) => setBlockerFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Tous les statuts</option>
                <option value="N">Actif</option>
                <option value="O">Bloqué</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
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
                  placeholder="Rechercher un verger..."
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
                <Link
                  to={"/gestion/verger/add"}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Verger
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VERGER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LOCALISATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RÉGION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TECHNICIEN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SUPERFICIE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIVE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedVergers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {filteredVergers.length === 0 && vergers.length > 0
                      ? "Aucun résultat trouvé pour votre recherche"
                      : "Aucun verger trouvé"}
                  </td>
                </tr>
              ) : (
                paginatedVergers.map((verger) => (
                  <tr key={verger.refver} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full ${getAvatarColor(
                            verger.nomver
                          )} flex items-center justify-center text-white text-sm font-medium mr-3`}
                        >
                          {verger.nomver?.substring(0, 2).toUpperCase() || "??"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {verger.nomver || "N/A"}
                          </div>
                          {verger.libelle && (
                            <div className="text-sm text-gray-500">
                              {verger.libelle}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            Réf: {verger.refver}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {verger.locver || verger.douar || "N/A"}
                      </div>
                      {verger.douar && verger.locver !== verger.douar && (
                        <div className="text-sm text-gray-500">
                          {verger.douar}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {verger.region || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {verger.tecver || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatSuperficie(verger.supver)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCertifBadge(
                          verger.certif
                        )}`}
                      >
                        {verger.certif || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBlockerBadge(
                          verger.blocker
                        )}`}
                      >
                        {verger.blocker === "N"
                          ? "Actif"
                          : verger.blocker === "O"
                            ? "Bloqué"
                            : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/gestion/verger/${verger.refver}`}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(verger)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/gestion/verger/edit/${verger.refver}`}
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
              Affichage de {startIndex + 1} à{" "}
              {Math.min(startIndex + itemsPerPage, filteredVergers.length)} sur{" "}
              {filteredVergers.length} entrées
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                      ? "bg-primary-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
        message="Êtes-vous sûr de vouloir supprimer le verger {itemName} ? Cette action est irréversible."
        itemName={deleteModal.verger?.nomver || deleteModal.verger?.libelle}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleteModal.loading}
        loadingText="Suppression..."
        type="danger"
      />
    </>
  );
};

export default VergerTable;
