import { useEffect, useState } from "react";
import VideojuegoCard from "../components/VideojuegoCard";

const API_URL = "http://127.0.0.1:8000/api/videojuegos/";
const TOKEN_URL = "http://127.0.0.1:8000/api-token-auth/";

const formularioInicial = {
    nombre: "",
    genero: "",
    plataforma: "PC",
    clasificacion: "",
    fecha_lanzamiento: "",
    activo: true,
};

export default function Videojuegos() {

    const [videojuegos, setVideojuegos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);

    const [formulario, setFormulario] = useState(formularioInicial);

    const [credenciales, setCredenciales] = useState({
        username: "",
        password: "",
    });

    const [token, setToken] = useState("");
    const [autenticando, setAutenticando] = useState(false);

    // --------------------------------------------------
    // CARGAR VIDEOJUEGOS
    // --------------------------------------------------

    useEffect(() => {
        cargarVideojuegos();
    }, []);

    async function cargarVideojuegos() {
        try {
            setCargando(true);
            setError("");

            const respuesta = await fetch(API_URL);

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const datos = await respuesta.json();
            setVideojuegos(datos);

        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    // --------------------------------------------------
    // MANEJAR CAMBIOS DE CREDENCIALES
    // --------------------------------------------------

    function manejarCambioCredenciales(e) {
        setCredenciales({
            ...credenciales,
            [e.target.name]: e.target.value,
        });
    }

    // --------------------------------------------------
    // INICIAR SESION
    // --------------------------------------------------

    async function iniciarSesion(e) {
        e.preventDefault();

        try {
            setAutenticando(true);
            setError("");
            setMensaje("");

            const datosLogin = new URLSearchParams();

            datosLogin.append("username", credenciales.username);
            datosLogin.append("password", credenciales.password);

            const respuesta = await fetch(TOKEN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: datosLogin,
            });

            if (!respuesta.ok) {
                throw new Error("Usuario o contraseña incorrectos");
            }

            const datos = await respuesta.json();

            setToken(datos.token);

            setCredenciales((actuales) => ({
                ...actuales,
                password: "",
            }));

            setMensaje("Autenticación correcta");

        } catch (err) {
            setError(err.message);
        } finally {
            setAutenticando(false);
        }
    }

    // --------------------------------------------------
    // MANEJAR CAMBIOS DEL FORMULARIO
    // --------------------------------------------------

    function manejarCambio(e) {
        const { name, value, type, checked } = e.target;

        setFormulario({
            ...formulario,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    // --------------------------------------------------
    // VALIDAR FORMULARIO
    // --------------------------------------------------

    function validarFormulario() {

        if (!formulario.nombre.trim()) {
            setError("El nombre es obligatorio");
            return false;
        }

        if (!formulario.plataforma) {
            setError("Debe seleccionar una plataforma");
            return false;
        }

        return true;
    }

    // --------------------------------------------------
    // CREAR VIDEOJUEGO
    // --------------------------------------------------

    async function crearVideojuego() {

        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(formulario),
        });

        if (!respuesta.ok) {
            throw new Error("No se puede crear el videojuego");
        }

        const nuevo = await respuesta.json();

        setVideojuegos((actuales) => [...actuales, nuevo]);
    }

    // --------------------------------------------------
    // INICIAR EDICION
    // --------------------------------------------------

    function iniciarEdicion(videojuego) {

        setEditandoId(videojuego.id);

        setFormulario({
            nombre: videojuego.nombre ?? "",
            genero: videojuego.genero ?? "",
            plataforma: videojuego.plataforma ?? "PC",
            clasificacion: videojuego.clasificacion ?? "",
            fecha_lanzamiento: videojuego.fecha_lanzamiento ?? "",
            activo: videojuego.activo ?? true,
        });

        setMensaje("");
        setError("");
    }

    // --------------------------------------------------
    // ACTUALIZAR VIDEOJUEGO
    // --------------------------------------------------

    async function actualizarVideoJuego() {

        const respuesta = await fetch(`${API_URL}${editandoId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(formulario),
        });

        if (!respuesta.ok) {
            throw new Error("No se puede actualizar el videojuego");
        }

        const actualizado = await respuesta.json();

        setVideojuegos((actuales) =>
            actuales.map((videojuego) =>
                videojuego.id === actualizado.id
                    ? actualizado
                    : videojuego
            )
        );
    }

    // --------------------------------------------------
    // GUARDAR VIDEOJUEGO
    // --------------------------------------------------

    async function guardarVideojuego(e) {

        e.preventDefault();

        if (!validarFormulario()) return;

        try {
            setProcesando(true);
            setError("");
            setMensaje("");

            if (editandoId === null) {

                await crearVideojuego();
                setMensaje("Videojuego creado correctamente");

            } else {

                await actualizarVideoJuego();
                setMensaje("Videojuego actualizado correctamente");
            }

            setFormulario(formularioInicial);
            setEditandoId(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(false);
        }
    }

    // --------------------------------------------------
    // CANCELAR EDICION
    // --------------------------------------------------

    function cancelarEdicion() {

        setEditandoId(null);
        setFormulario(formularioInicial);
        setMensaje("");
        setError("");
    }

    // --------------------------------------------------
    // ELIMINAR VIDEOJUEGO
    // --------------------------------------------------

    async function eliminarVideoJuego(id) {

        const confirmar = window.confirm(
            "¿Desea eliminar este videojuego?"
        );

        if (!confirmar) return;

        try {
            setError("");
            setMensaje("");

            const respuesta = await fetch(`${API_URL}${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (!respuesta.ok) {
                throw new Error("No se puede eliminar el videojuego");
            }

            setVideojuegos((actuales) =>
                actuales.filter((videojuego) => videojuego.id !== id)
            );

            if (editandoId === id) {
                cancelarEdicion();
            }

            setMensaje("Videojuego eliminado correctamente");

        } catch (err) {
            setError(err.message);
        }
    }

    // --------------------------------------------------
    // MOSTRAR CARGA
    // --------------------------------------------------

    if (cargando) {
        return <p>Cargando videojuegos...</p>;
    }

    // --------------------------------------------------
    // INTERFAZ PRINCIPAL
    // --------------------------------------------------

    return (
        <section className="container py-4">

            <h1 className="mb-4">GameArena</h1>

            {/* AUTENTICACION */}

            {!token ? (

                <form
                    onSubmit={iniciarSesion}
                    className="card card-body mb-4"
                >

                    <h2 className="h4 mb-3">Autenticación</h2>

                    <div className="mb-3">

                        <label className="form-label">
                            Usuario
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={credenciales.username}
                            onChange={manejarCambioCredenciales}
                            required
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Contraseña
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={credenciales.password}
                            onChange={manejarCambioCredenciales}
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn btn-dark"
                        disabled={autenticando}
                    >
                        {autenticando
                            ? "Autenticando..."
                            : "Obtener token"}
                    </button>

                </form>

            ) : (

                <div className="alert alert-info">
                    Usuario autenticado. El token se enviará en POST,
                    PATCH y DELETE.
                </div>

            )}

            {/* MENSAJES */}

            {mensaje && (
                <div className="alert alert-success">
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* FORMULARIO VIDEOJUEGO */}

            <form
                onSubmit={guardarVideojuego}
                className="card card-body mb-4"
            >

                <h2 className="h4 mb-3">
                    {editandoId !== null
                        ? "Editar videojuego"
                        : "Nuevo videojuego"}
                </h2>

                <div className="mb-3">

                    <label className="form-label">
                        Nombre
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={manejarCambio}
                        required
                    />

                </div>

                <div className="mb-3">

                    <label className="form-label">
                        Género
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        name="genero"
                        value={formulario.genero}
                        onChange={manejarCambio}
                    />

                </div>

                <div className="mb-3">

                    <label className="form-label">
                        Plataforma
                    </label>

                    <select
                        className="form-select"
                        name="plataforma"
                        value={formulario.plataforma}
                        onChange={manejarCambio}
                    >

                        <option value="PC">PC</option>
                        <option value="PlayStation">PlayStation</option>
                        <option value="Xbox">Xbox</option>
                        <option value="Nintendo">Nintendo</option>

                    </select>

                </div>

                <div className="mb-3">

                    <label className="form-label">
                        Clasificación
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        name="clasificacion"
                        value={formulario.clasificacion}
                        onChange={manejarCambio}
                    />

                </div>

                <div className="mb-3">

                    <label className="form-label">
                        Fecha de lanzamiento
                    </label>

                    <input
                        type="date"
                        className="form-control"
                        name="fecha_lanzamiento"
                        value={formulario.fecha_lanzamiento}
                        onChange={manejarCambio}
                    />

                </div>

                <div className="mb-3">

                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="activo"
                        checked={formulario.activo}
                        onChange={manejarCambio}
                    />

                    <label className="form-check-label ms-2">
                        Activo
                    </label>

                </div>

                <div className="d-flex gap-2">

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={procesando}
                    >
                        {procesando
                            ? "Procesando..."
                            : editandoId !== null
                                ? "Actualizar"
                                : "Guardar"}
                    </button>

                    {editandoId !== null && (

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={cancelarEdicion}
                        >
                            Cancelar
                        </button>

                    )}

                </div>

            </form>

            {/* LISTA DE VIDEOJUEGOS */}

            <h2 className="mb-3">Videojuegos registrados</h2>

            <div className="row g-3">

                {videojuegos.map((videojuego) => (

                    <VideojuegoCard
                        key={videojuego.id}
                        videojuego={videojuego}
                        onEditar={iniciarEdicion}
                        onEliminar={eliminarVideoJuego}
                    />

                ))}

            </div>

        </section>
    );
}