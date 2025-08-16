import { useState, useEffect } from 'react';
import { X, Calendar, FileText, Building, User } from 'lucide-react';
import Modal from '../../ui/Modal';
import VergerService from '../../../utils/VergerService';
import TypeCertificatService from '../../../utils/TypeCertificatService';
import OrganismeService from '../../../utils/OrganismeService';

const CertificatModal = ({ isOpen, onClose, onSave, certificat }) => {
    const [formData, setFormData] = useState({
        refver: '',
        idTypeCertificat: '',
        idOrganisme: '',
        numeroCertificat: '',
        dateObtention: '',
        dateExpiration: '',
        dateAudit: '',
        tauxReussite: '',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Options pour les selects - à remplacer par des appels API réels
    const [vergers, setVergers] = useState([]);
    const [typesCertificat, setTypesCertificat] = useState([]);
    const [organismes, setOrganismes] = useState([]);

    useEffect(() => {
        if (certificat) {
            setFormData({
                refver: certificat.refver || '',
                idTypeCertificat: certificat.idTypeCertificat || '',
                idOrganisme: certificat.idOrganisme || '',
                numeroCertificat: certificat.numeroCertificat || '',
                dateObtention: certificat.dateObtention ? formatDateForInput(certificat.dateObtention) : '',
                dateExpiration: certificat.dateExpiration ? formatDateForInput(certificat.dateExpiration) : '',
                dateAudit: certificat.dateAudit ? formatDateForInput(certificat.dateAudit) : '',
                tauxReussite: certificat.tauxReussite || '',
                notes: certificat.notes || ''
            });
        } else {
            setFormData({
                refver: '',
                idTypeCertificat: '',
                idOrganisme: '',
                numeroCertificat: '',
                dateObtention: '',
                dateExpiration: '',
                dateAudit: '',
                tauxReussite: '',
                notes: ''
            });
        }
        setErrors({});
    }, [certificat, isOpen]);

    useEffect(() => {
        if (isOpen) {
            loadFormData();
        }
    }, [isOpen]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const loadFormData = async () => {
        try {
            // Charger les données depuis les APIs
            const [vergersData, typesCertificatData, organismesData] = await Promise.all([
                VergerService.getAllVergers(true), // Inclure tous les vergers (actifs et inactifs)
                TypeCertificatService.getAllTypesCertificat(true), // Inclure tous les types (actifs et inactifs)
                OrganismeService.getOrganismesActifs() // Garder seulement les organismes actifs
            ]);

            // Adapter les données selon le format attendu
            const vergersFormatted = vergersData.map(verger => ({
                id: verger.refver,
                nom: `${verger.nomver || verger.nomVerger || verger.nom}${verger.actif === 0 ? ' (Inactif)' : ''}`,
                refver: verger.refver,
                actif: verger.actif
            }));

            setVergers(vergersFormatted);

            setTypesCertificat(typesCertificatData.map(type => ({
                id: type.idTypeCertificat,
                nom: `${type.nomType}${type.actif === 0 ? ' (Inactif)' : ''}`,
                actif: type.actif
            })));

            setOrganismes(organismesData.map(organisme => ({
                id: organisme.idOrganisme,
                nom: organisme.nomOrganisme
            })));

        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            // En cas d'erreur, utiliser des données par défaut
            setVergers([]);
            setTypesCertificat([]);
            setOrganismes([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Nettoyer l'erreur quand l'utilisateur tape
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.refver) newErrors.refver = 'Le verger est requis';
        if (!formData.idTypeCertificat) newErrors.idTypeCertificat = 'Le type de certificat est requis';
        if (!formData.idOrganisme) newErrors.idOrganisme = 'L\'organisme est requis';
        if (!formData.numeroCertificat) newErrors.numeroCertificat = 'Le numéro de certificat est requis';
        if (!formData.dateExpiration) newErrors.dateExpiration = 'La date d\'expiration est requise';
        
        if (formData.tauxReussite && (formData.tauxReussite < 0 || formData.tauxReussite > 100)) {
            newErrors.tauxReussite = 'Le taux doit être entre 0 et 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                refver: parseInt(formData.refver),
                idTypeCertificat: parseInt(formData.idTypeCertificat),
                idOrganisme: parseInt(formData.idOrganisme),
                tauxReussite: formData.tauxReussite ? parseFloat(formData.tauxReussite) : null,
                dateObtention: formData.dateObtention || null,
                dateAudit: formData.dateAudit || null
            };

            console.log(dataToSave)

            if (certificat) {
                dataToSave.idCertificat = certificat.idCertificat;
            }

            await onSave(dataToSave);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {certificat ? 'Modifier le certificat' : 'Nouveau certificat'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {certificat ? 'Modifiez les informations du certificat' : 'Ajoutez un nouveau certificat'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Verger */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building className="inline w-4 h-4 mr-1" />
                            Verger *
                        </label>
                        <select
                            name="refver"
                            value={formData.refver}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.refver ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Sélectionner un verger</option>
                            {vergers.map(verger => (
                                <option 
                                    key={verger.refver} 
                                    value={verger.refver}
                                    style={{ 
                                        color: verger.actif === 0 ? '#9CA3AF' : 'inherit',
                                        fontStyle: verger.actif === 0 ? 'italic' : 'normal'
                                    }}
                                >
                                    {verger.nom} ({verger.refver})
                                </option>
                            ))}
                        </select>
                        {errors.refver && <p className="text-red-500 text-xs mt-1">{errors.refver}</p>}
                    </div>

                    {/* Type de certificat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="inline w-4 h-4 mr-1" />
                            Type de certificat *
                        </label>
                        <select
                            name="idTypeCertificat"
                            value={formData.idTypeCertificat}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.idTypeCertificat ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Sélectionner un type</option>
                            {typesCertificat.map(type => (
                                <option 
                                    key={type.id} 
                                    value={type.id}
                                    style={{ 
                                        color: type.actif === 0 ? '#9CA3AF' : 'inherit',
                                        fontStyle: type.actif === 0 ? 'italic' : 'normal'
                                    }}
                                >
                                    {type.nom}
                                </option>
                            ))}
                        </select>
                        {errors.idTypeCertificat && <p className="text-red-500 text-xs mt-1">{errors.idTypeCertificat}</p>}
                    </div>

                    {/* Organisme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="inline w-4 h-4 mr-1" />
                            Organisme de certification *
                        </label>
                        <select
                            name="idOrganisme"
                            value={formData.idOrganisme}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.idOrganisme ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Sélectionner un organisme</option>
                            {organismes.map(organisme => (
                                <option key={organisme.id} value={organisme.id}>
                                    {organisme.nom}
                                </option>
                            ))}
                        </select>
                        {errors.idOrganisme && <p className="text-red-500 text-xs mt-1">{errors.idOrganisme}</p>}
                    </div>

                    {/* Numéro de certificat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de certificat *
                        </label>
                        <input
                            type="text"
                            name="numeroCertificat"
                            value={formData.numeroCertificat}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.numeroCertificat ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ex: BIO-2024-001"
                        />
                        {errors.numeroCertificat && <p className="text-red-500 text-xs mt-1">{errors.numeroCertificat}</p>}
                    </div>

                    {/* Date d'obtention */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Date d'obtention
                        </label>
                        <input
                            type="date"
                            name="dateObtention"
                            value={formData.dateObtention}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date d'expiration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Date d'expiration *
                        </label>
                        <input
                            type="date"
                            name="dateExpiration"
                            value={formData.dateExpiration}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.dateExpiration ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.dateExpiration && <p className="text-red-500 text-xs mt-1">{errors.dateExpiration}</p>}
                    </div>

                    {/* Date d'audit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Date d'audit
                        </label>
                        <input
                            type="date"
                            name="dateAudit"
                            value={formData.dateAudit}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Taux de réussite */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Taux de réussite (%)
                        </label>
                        <input
                            type="number"
                            name="tauxReussite"
                            value={formData.tauxReussite}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.tauxReussite ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ex: 95.5"
                        />
                        {errors.tauxReussite && <p className="text-red-500 text-xs mt-1">{errors.tauxReussite}</p>}
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Notes additionnelles..."
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {certificat ? 'Modifier' : 'Créer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CertificatModal;