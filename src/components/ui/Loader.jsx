import { Loader2 } from 'lucide-react'

function Loader() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Chargement des informations...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loader