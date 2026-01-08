import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HiCalendar, HiClock, HiUser, HiCheckCircle } from 'react-icons/hi';
import { appointmentsApi } from '../../api/appointments';
import { servicesApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object({
  client_name: yup.string().when('$isAuthenticated', {
    is: false,
    then: (s) => s.required('El nombre es requerido'),
  }),
  client_email: yup.string().when('$isAuthenticated', {
    is: false,
    then: (s) => s.required('El email es requerido').email('Email inválido'),
  }),
  client_phone: yup.string(),
  notes: yup.string(),
});

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [step, setStep] = useState(1);
  const [lawyers, setLawyers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '');
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { isAuthenticated },
  });

  // Cargar abogados y servicios
  useEffect(() => {
    const loadData = async () => {
      try {
        const [lawyersRes, servicesRes] = await Promise.all([
          appointmentsApi.getLawyers(),
          servicesApi.getAll(),
        ]);
        setLawyers(lawyersRes.data);
        setServices(servicesRes.data.services || servicesRes.data);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar los datos');
      }
    };
    loadData();
  }, []);

  // Cargar disponibilidad cuando se selecciona fecha
  useEffect(() => {
    if (selectedLawyer && selectedDate) {
      loadAvailability();
    }
  }, [selectedLawyer, selectedDate]);

  const loadAvailability = async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await appointmentsApi.getAvailability(selectedLawyer.id, dateStr);
      setAvailableSlots(res.data.slots);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleLawyerSelect = (lawyer) => {
    setSelectedLawyer(lawyer);
    setSelectedDate(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const appointmentPayload = {
        lawyer_id: selectedLawyer.id,
        service_id: selectedService || null,
        appointment_date: selectedDate.toISOString().split('T')[0],
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        notes: data.notes,
        type: 'consultation',
      };

      if (!isAuthenticated) {
        appointmentPayload.client_name = data.client_name;
        appointmentPayload.client_email = data.client_email;
        appointmentPayload.client_phone = data.client_phone;
      }

      const res = await appointmentsApi.create(appointmentPayload);
      setAppointmentData(res.data.appointment);
      setSuccess(true);
    } catch (error) {
      console.error('Error creando cita:', error);
      toast.error(error.response?.data?.error || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar fechas: solo días laborales futuros
  const filterDate = (date) => {
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Excluir fines de semana (0=domingo, 6=sábado) y fechas pasadas
    return day !== 0 && day !== 6 && date >= today;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Cita Agendada!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu cita ha sido registrada exitosamente. Recibirás un email de confirmación con los detalles.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="mb-2">
                <span className="font-medium">Fecha:</span>{' '}
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="mb-2">
                <span className="font-medium">Hora:</span> {selectedSlot.start_time} - {selectedSlot.end_time}
              </p>
              <p>
                <span className="font-medium">Abogado:</span> {selectedLawyer.full_name}
              </p>
            </div>
            <a
              href="/"
              className="btn-primary inline-block"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Agendar Cita</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reserve una consulta con uno de nuestros abogados especializados
          </p>
        </div>

        {/* Pasos */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-20 h-1 ${
                      step > s ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Abogado</span>
            <span>Fecha y Hora</span>
            <span>Datos</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-4xl mx-auto">
          {/* Paso 1: Seleccionar Abogado */}
          {step === 1 && (
            <div>
              {/* Filtro de servicio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por servicio (opcional)
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="input-field max-w-md"
                >
                  <option value="">Todos los servicios</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista de abogados */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lawyers.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500 py-8">
                    No hay abogados disponibles en este momento
                  </p>
                ) : (
                  lawyers.map((lawyer) => (
                    <div
                      key={lawyer.id}
                      onClick={() => handleLawyerSelect(lawyer)}
                      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary"
                    >
                      <div className="flex items-center mb-4">
                        {lawyer.photo_url ? (
                          <img
                            src={lawyer.photo_url}
                            alt={lawyer.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <HiUser className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-900">{lawyer.full_name}</h3>
                          <p className="text-sm text-gray-600">{lawyer.specialization}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p className="flex items-center">
                          <HiCalendar className="w-4 h-4 mr-1" />
                          {lawyer.appointmentSlots?.length || 0} horarios disponibles
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Paso 2: Seleccionar Fecha y Hora */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={() => setStep(1)}
                className="text-primary hover:underline mb-4 flex items-center"
              >
                ← Cambiar abogado
              </button>

              <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                {selectedLawyer.photo_url ? (
                  <img
                    src={selectedLawyer.photo_url}
                    alt={selectedLawyer.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <HiUser className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="ml-3">
                  <h3 className="font-bold">{selectedLawyer.full_name}</h3>
                  <p className="text-sm text-gray-600">{selectedLawyer.specialization}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Calendario */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <HiCalendar className="w-5 h-5 mr-2" />
                    Selecciona una fecha
                  </h3>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateSelect}
                    filterDate={filterDate}
                    inline
                    minDate={new Date()}
                    locale="es"
                    calendarClassName="!w-full"
                  />
                </div>

                {/* Horarios */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <HiClock className="w-5 h-5 mr-2" />
                    Horarios disponibles
                  </h3>

                  {!selectedDate ? (
                    <p className="text-gray-500 text-center py-8">
                      Selecciona una fecha para ver los horarios
                    </p>
                  ) : loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No hay horarios disponibles para esta fecha
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-3 rounded-lg border-2 text-center transition-colors ${
                            selectedSlot?.start_time === slot.start_time
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 hover:border-primary'
                          }`}
                        >
                          {slot.start_time} - {slot.end_time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Datos del cliente */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={() => setStep(2)}
                className="text-primary hover:underline mb-4 flex items-center"
              >
                ← Cambiar fecha/hora
              </button>

              {/* Resumen */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-2">Resumen de tu cita</h3>
                <p><span className="font-medium">Abogado:</span> {selectedLawyer.full_name}</p>
                <p>
                  <span className="font-medium">Fecha:</span>{' '}
                  {selectedDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p><span className="font-medium">Hora:</span> {selectedSlot.start_time} - {selectedSlot.end_time}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {!isAuthenticated && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          {...register('client_name')}
                          className="input-field"
                          placeholder="Tu nombre"
                        />
                        {errors.client_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.client_name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          {...register('client_email')}
                          className="input-field"
                          placeholder="tu@email.com"
                        />
                        {errors.client_email && (
                          <p className="text-red-500 text-sm mt-1">{errors.client_email.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono (opcional)
                      </label>
                      <input
                        type="tel"
                        {...register('client_phone')}
                        className="input-field max-w-xs"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </>
                )}

                {isAuthenticated && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800">
                      La cita se agendará con tu cuenta: <strong>{user.email}</strong>
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas o motivo de consulta (opcional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="input-field"
                    placeholder="Describe brevemente el motivo de tu consulta..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Agendando...' : 'Confirmar Cita'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
