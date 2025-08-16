import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Calendar } from 'lucide-react';
import API from "../../../utils/Api";
import Loader from '../../../components/ui/Loader';
import DeclarationVergerTable from '../../../components/declarationverger/DeclarationVergerTable';
import AnalyticsCard from '../../../components/dashboard/AnalyticsCard';

function DeclarationVerger() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/DeclarationVergers");

      if (res.data && Array.isArray(res.data)) {
        setDeclarations(res.data);
      } else {
        setDeclarations(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Error fetching declarations:', error);
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

  console.log(declarations)

  // Calculate analytics based on declarations data
  const calculateAnalytics = () => {
    if (!declarations.length) {
      return {
        total: 0,
        validated: 0,
        pending: 0,
        recentDeclarations: 0
      };
    }

    // Calculate date 2 months ago
    const today = new Date();
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());

    // Count by status (assuming there's a status field)
    const validated = declarations.filter(item => item.status === 'Validé' || item.status === 'validated').length;
    const pending = declarations.filter(item => item.status === 'En attente' || item.status === 'pending').length;
    const total = declarations.length;

    // Count declarations created in last 2 months
    const recentDeclarations = declarations.filter(item => {
      if (!item.dateCreation && !item.dtadd) return false;
      const declarationDate = new Date(item.dateCreation || item.dtadd);
      return declarationDate >= twoMonthsAgo;
    }).length;

    return { total, validated, pending, recentDeclarations };
  };

  const analytics = calculateAnalytics();

  // In a real application, you would compare with previous period data
  const getChangePercentage = (current, type) => {
    const mockPrevious = {
      total: Math.max(1, Math.floor(current * 0.85)),
      validated: Math.max(1, Math.floor(current * 0.9)),
      pending: Math.max(1, Math.floor(current * 0.8)),
      recentDeclarations: Math.max(1, Math.floor(current * 0.7))
    };

    const previous = mockPrevious[type] || 1;
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const cards = [
    {
      title: "Total Déclarations",
      value: analytics.total.toLocaleString(),
      change: getChangePercentage(analytics.total, 'total'),
      subtitle: "Nombre total de déclarations",
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: analytics.total > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "Validées",
      value: analytics.validated.toLocaleString(),
      change: getChangePercentage(analytics.validated, 'validated'),
      subtitle: "Déclarations validées",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: analytics.validated > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "En attente",
      value: analytics.pending.toLocaleString(),
      change: getChangePercentage(analytics.pending, 'pending'),
      subtitle: "Déclarations en attente",
      icon: XCircle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      changeColor: analytics.pending > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "Récentes (2 mois)",
      value: analytics.recentDeclarations.toLocaleString(),
      change: getChangePercentage(analytics.recentDeclarations, 'recentDeclarations'),
      subtitle: "Créées dans les 2 derniers mois",
      icon: Calendar,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: analytics.recentDeclarations > 0 ? "text-green-600" : "text-gray-500"
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:p-6">
        {cards.map((card, index) => (
          <AnalyticsCard card={card} key={index} />
        ))}
      </div>

      {/* Declaration Verger Table */}
      <div className='sm:p-6'>
        <DeclarationVergerTable
          initialData={declarations}
          onRefresh={fetchData}
        />
      </div>
    </div>
  )
}

export default DeclarationVerger