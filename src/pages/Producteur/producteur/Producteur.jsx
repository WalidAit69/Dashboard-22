import { useState, useEffect } from 'react';
import AnalyticsCard from '../../../components/dashboard/AnalyticsCard'
import ProducteurTable from '../../../components/producteur/ProducteurTable'
import { Users, UserCheck, Activity, Clock } from 'lucide-react';
import API from "../../../utils/Api";
import Loader from '../../../components/ui/Loader';

function Producteur() {
  const [adherents, setAdherents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/Adherents");

      if (res.data && Array.isArray(res.data)) {
        setAdherents(res.data);
      } else {
        setAdherents(res.data ? [res.data] : []);
      }
    } catch (error) {
      console.error('Error fetching adherents:', error);
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

  // Calculate analytics based on adherents data
  const calculateAnalytics = () => {
    if (!adherents.length) {
      return {
        nonAdherent: 0,
        adherent: 0,
        achat: 0,
        presta: 0,
        total: 0
      };
    }

    // Count by type
    const nonAdherent = adherents.filter(item => item.type === 'Non Adherent').length;
    const adherent = adherents.filter(item => item.type === 'Adherent').length;
    const achat = adherents.filter(item => item.type === 'Achat').length;
    const presta = adherents.filter(item => item.type === 'PRESTA').length;
    const total = adherents.length;

    return { nonAdherent, adherent, achat, presta, total };
  };

  const analytics = calculateAnalytics();

  // In a real application, you would compare with previous period data
  const getChangePercentage = (current, type) => {

    const mockPrevious = {
      nonAdherent: Math.max(1, Math.floor(current * 0.8)),
      adherent: Math.max(1, Math.floor(current * 0.9)),
      achat: Math.max(1, Math.floor(current * 0.85)),
      presta: Math.max(1, Math.floor(current * 0.75))
    };

    const previous = mockPrevious[type] || 1;
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const cards = [
    {
      title: "Non Adhérent",
      value: analytics.nonAdherent.toLocaleString(),
      change: getChangePercentage(analytics.nonAdherent, 'nonAdherent'),
      subtitle: "Producteurs non adhérents",
      icon: Users,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      changeColor: analytics.nonAdherent > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "Adhérent",
      value: analytics.adherent.toLocaleString(),
      change: getChangePercentage(analytics.adherent, 'adherent'),
      subtitle: "Producteurs adhérents",
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: analytics.adherent > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "Achat",
      value: analytics.achat.toLocaleString(),
      change: getChangePercentage(analytics.achat, 'achat'),
      subtitle: "Type Achat",
      icon: Activity,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: analytics.achat > 0 ? "text-green-600" : "text-gray-500"
    },
    {
      title: "PRESTA",
      value: analytics.presta.toLocaleString(),
      change: getChangePercentage(analytics.presta, 'presta'),
      subtitle: "Type Prestation",
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      changeColor: analytics.presta > 0 ? "text-green-600" : "text-gray-500"
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

      {/* Producteur Table */}
      <div className='sm:p-6'>
        <ProducteurTable
          initialData={adherents}
          onRefresh={fetchData}
        />
      </div>
    </div>
  )
}

export default Producteur