import { useState, useEffect } from 'react';
import { TrendingUp, Package, Globe, Users } from 'lucide-react';
import AnalyticsCard from '../components/Gestion/dashboard/AnalyticsCard';
import TopVarietesChart from '../components/Dashboard/TopVarietesChart';
import TopDestinationsChart from '../components/Dashboard/TopDestinationsChart';
import TopExportateurChart from '../components/Dashboard/TopExportateurChart';
import TvnExpEcaTable from '../components/Dashboard/TvnExpEcaTable';
import DashboardService from '../services/dashboardService';

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const summary = await DashboardService.getSummary();
                setDashboardData(summary);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatNumber = (number) => {
        if (number == null) return '0';
        return Number(number).toLocaleString('fr-FR');
    };

    const cards = dashboardData ? [
        {
            title: "Total Exportation",
            value: formatNumber(dashboardData.totalExportation),
            change: `${dashboardData.tauxExportationGlobal}%`,
            subtitle: "Taux d'exportation global",
            icon: TrendingUp,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            changeColor: "text-blue-600"
        },
        {
            title: "Stock Disponible",
            value: formatNumber(dashboardData.totalStock),
            change: `${dashboardData.nombreVarietes}`,
            subtitle: "Variétés en stock",
            icon: Package,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            changeColor: "text-gray-600"
        },
        {
            title: "Destinations",
            value: formatNumber(dashboardData.nombreDestinations),
            change: formatNumber(dashboardData.totalReception),
            subtitle: "Total réception",
            icon: Globe,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
            changeColor: "text-gray-600"
        },
        {
            title: "Exportateurs",
            value: formatNumber(dashboardData.nombreExportateurs),
            change: `${dashboardData.tauxFreinteGlobal}%`,
            subtitle: "Taux de freinte global",
            icon: Users,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
            changeColor: "text-orange-600"
        }
    ] : [];

    if (loading) {
        return (
            <div className="flex flex-col gap-4 sm:gap-0 min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:p-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-0 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:p-6">
                {cards.map((card, index) => (
                    <AnalyticsCard card={card} key={index} />
                ))}
            </div>

            <div className='sm:p-6'>
                <div className="mb-6">
                    <TvnExpEcaTable />
                </div>
            </div>

            <div className='sm:px-6 pb-6'>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <TopVarietesChart />
                    <TopDestinationsChart />
                    <TopExportateurChart />
                </div>
            </div>
        </div>
    )
}

export default Dashboard