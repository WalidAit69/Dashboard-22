import { useState, useEffect } from 'react';
import { FileText, Home, Building } from 'lucide-react';
import API from "../../../../utils/Api";
import Loader from '../../../../components/ui/Loader';
import DeclarationVergerTable from '../../../../components/Gestion/declarationverger/DeclarationVergerTable';
import AnalyticsCard from '../../../../components/Gestion/dashboard/AnalyticsCard';

function DeclarationVerger() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter options data
  const [vergers, setVergers] = useState([]);
  const [varietes, setVarietes] = useState([]);
  const [stations, setStations] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    refverReel: '',
    refverNreel: '',
    codvar: '',
    station: ''
  });

  // Fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [declarationsRes, vergersRes, varietesRes] = await Promise.all([
        API.get("/DeclarationVergers"),
        API.get("/Vergers"),
        API.get("/Varietes")
      ]);

      // Set declarations data
      if (declarationsRes.data && Array.isArray(declarationsRes.data)) {
        setDeclarations(declarationsRes.data);
      } else {
        setDeclarations(declarationsRes.data ? [declarationsRes.data] : []);
      }

      // Set vergers data
      if (vergersRes.data && Array.isArray(vergersRes.data)) {
        setVergers(vergersRes.data);
      } else {
        setVergers(vergersRes.data ? [vergersRes.data] : []);
      }

      // Set varietes data
      if (varietesRes.data && Array.isArray(varietesRes.data)) {
        setVarietes(varietesRes.data);
      } else {
        setVarietes(varietesRes.data ? [varietesRes.data] : []);
      }

      // Extract unique stations from declarations
      const uniqueStations = [...new Set(
        (declarationsRes.data || [])
          .map(item => item.refstat)
          .filter(station => station !== null && station !== undefined)
      )];
      setStations(uniqueStations);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError({
        message: error.response?.data?.message || error.message || 'Failed to fetch data',
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter declarations based on current filters
  const getFilteredDeclarations = () => {
    return declarations.filter(declaration => {
      // Filter by refverReel
      if (filters.refverReel && declaration.refverReel !== parseInt(filters.refverReel)) {
        return false;
      }
      
      // Filter by refverNreel
      if (filters.refverNreel && declaration.refverNreel !== parseInt(filters.refverNreel)) {
        return false;
      }

      // Filter by codvar (variety)
      if (filters.codvar && declaration.codvar !== parseInt(filters.codvar)) {
        return false;
      }

      // Filter by station
      if (filters.station && declaration.refstat !== filters.station) {
        return false;
      }

      return true;
    });
  };

  const filteredDeclarations = getFilteredDeclarations();

  // Calculate analytics based on filtered declarations data
  const calculateAnalytics = () => {
    if (!filteredDeclarations.length) {
      return {
        total: 0,
        totalVergerReel: 0,
        totalVergerNonReel: 0
      };
    }

    const total = filteredDeclarations.length;

    // Count unique VERGER RÉEL (refverReel)
    const uniqueVergerReel = new Set(
      filteredDeclarations
        .filter(item => item.refverReel !== null && item.refverReel !== undefined)
        .map(item => item.refverReel)
    );
    const totalVergerReel = uniqueVergerReel.size;

    // Count unique VERGER Non-RÉEL (refverNreel)
    const uniqueVergerNonReel = new Set(
      filteredDeclarations
        .filter(item => item.refverNreel !== null && item.refverNreel !== undefined)
        .map(item => item.refverNreel)
    );
    const totalVergerNonReel = uniqueVergerNonReel.size;

    return { total, totalVergerReel, totalVergerNonReel };
  };

  const analytics = calculateAnalytics();

  // In a real application, you would compare with previous period data
  const getChangePercentage = (current, type) => {
    const mockPrevious = {
      total: Math.max(1, Math.floor(current * 0.85)),
      totalVergerReel: Math.max(1, Math.floor(current * 0.9)),
      totalVergerNonReel: Math.max(1, Math.floor(current * 0.8))
    };

    const previous = mockPrevious[type] || 1;
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      refverReel: '',
      refverNreel: '',
      codvar: '',
      station: ''
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  const cards = [
    {
      title: "Total Déclarations",
      value: analytics.total.toLocaleString(),
      change: getChangePercentage(analytics.total, 'total'),
      subtitle: hasActiveFilters ? "Nombre de déclarations filtrées" : "Nombre total de déclarations",
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: analytics.total > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "Total VERGER RÉEL",
      value: analytics.totalVergerReel.toLocaleString(),
      change: getChangePercentage(analytics.totalVergerReel, 'totalVergerReel'),
      subtitle: hasActiveFilters ? "Vergers réels uniques (filtrés)" : "Nombre de vergers réels uniques",
      icon: Home,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: analytics.totalVergerReel > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "Total VERGER Non-RÉEL",
      value: analytics.totalVergerNonReel.toLocaleString(),
      change: getChangePercentage(analytics.totalVergerNonReel, 'totalVergerNonReel'),
      subtitle: hasActiveFilters ? "Vergers non-réels uniques (filtrés)" : "Nombre de vergers non-réels uniques",
      icon: Building,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: analytics.totalVergerNonReel > 0 ? "text-green-600" : "text-gray-500"
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Show error state
  if (error) {
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
    <div className="flex flex-col gap-4 sm:gap-0 min-h-screen">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:p-6">
        {cards.map((card, index) => (
          <AnalyticsCard card={card} key={index} />
        ))}
      </div>

      {/* Show filter summary if filters are active */}
      {hasActiveFilters && (
        <div className="sm:px-6 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-blue-800 text-sm font-medium">
                  Filtres actifs: {filteredDeclarations.length} résultat(s) sur {declarations.length} total
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Effacer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Declaration Verger Table */}
      <div className='sm:p-6'>
        <DeclarationVergerTable
          initialData={filteredDeclarations}
          onRefresh={fetchData}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          filterOptions={{
            vergers,
            varietes,
            stations
          }}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  )
}

export default DeclarationVerger