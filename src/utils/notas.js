export const calcularPromedioNotas = (notas = []) => {
    if (!Array.isArray(notas) || notas.length === 0) {
        return null;
    }

    const suma = notas.reduce((accumulado, nota) => accumulado + Number(nota.valor || 0), 0);
    return Number((suma / notas.length).toFixed(1));
};

export const obtenerNombreAsignatura = (nota) => {
    return nota?.evaluacion?.asignatura?.nombre || 'Sin asignatura';
};

export const agruparNotasPorAsignatura = (notas = []) => {
    if (!Array.isArray(notas) || notas.length === 0) {
        return [];
    }

    const grupos = notas.reduce((acumulado, nota) => {
        const nombreAsignatura = obtenerNombreAsignatura(nota);

        if (!acumulado[nombreAsignatura]) {
            acumulado[nombreAsignatura] = [];
        }

        acumulado[nombreAsignatura].push(nota);
        return acumulado;
    }, {});

    return Object.entries(grupos).map(([nombre, notasAsignatura]) => ({
        nombre,
        notas: notasAsignatura,
        promedio: calcularPromedioNotas(notasAsignatura)
    }));
};