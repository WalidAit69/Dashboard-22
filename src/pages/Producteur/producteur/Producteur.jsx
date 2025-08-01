import AnalyticsCard from '../../../components/dashboard/AnalyticsCard'
import ProducteurTable from '../../../components/producteur/ProducteurTable'
import { Users, UserCheck, Activity, Clock } from 'lucide-react';

function Producteur() {
  const cards = [
    {
      title: "Session",
      value: "21,459",
      change: "+29%",
      subtitle: "Total Users",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-green-600"
    },
    {
      title: "Paid Users",
      value: "4,567",
      change: "+18%",
      subtitle: "Last week analytics",
      icon: UserCheck,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      changeColor: "text-green-600"
    },
    {
      title: "Active Users",
      value: "19,860",
      change: "-14%",
      subtitle: "Last week analytics",
      icon: Activity,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-red-500"
    },
    {
      title: "Pending Users",
      value: "237",
      change: "+42%",
      subtitle: "Last week analytics",
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      changeColor: "text-green-600"
    }
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-0 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:p-6">
        {cards.map((card, index) => (
          <AnalyticsCard card={card} key={index} />
        ))}
      </div>

      <div className='sm:p-6'>
        <ProducteurTable />
      </div>
    </div>
  )
}

export default Producteur