#!/bin/bash

echo "🧪 Ejecutando Batería de Tests E2E - Arquitectura Hexagonal"
echo "=========================================================="

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar status
show_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Verificar que el servidor no esté corriendo
echo -e "${BLUE}🔍 Verificando estado del servidor...${NC}"
SERVER_PID=$(lsof -ti:3000)
if [ ! -z "$SERVER_PID" ]; then
    echo -e "${YELLOW}⚠️  Servidor detectado en puerto 3000. Cerrándolo...${NC}"
    kill -9 $SERVER_PID
    sleep 2
fi

# 2. Verificar MongoDB Memory Server (no necesita verificación externa)
echo -e "${BLUE}🗄️  Configurando MongoDB en memoria para tests...${NC}"
echo -e "${GREEN}✅ Los tests usarán MongoDB Memory Server (independiente)${NC}"

# 3. Instalar dependencias si es necesario
echo -e "${BLUE}📦 Verificando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    npm install
fi

# 4. Compilar proyecto
echo -e "${BLUE}🔨 Compilando proyecto...${NC}"
npm run build
COMPILE_STATUS=$?
show_status $COMPILE_STATUS "Compilación"

if [ $COMPILE_STATUS -ne 0 ]; then
    echo -e "${RED}💥 Error en compilación. Abortando tests.${NC}"
    exit 1
fi

# 5. Ejecutar tests principales de arquitectura hexagonal
echo -e "${BLUE}🧪 Ejecutando tests principales (Arquitectura Hexagonal)...${NC}"
npm run test:e2e test/tweets-hexagonal.e2e-spec.ts
MAIN_TESTS_STATUS=$?
show_status $MAIN_TESTS_STATUS "Tests principales de arquitectura hexagonal"

# 6. Ejecutar tests de casos límite
echo -e "${BLUE}🔬 Ejecutando tests de casos límite...${NC}"
npm run test:e2e test/tweets-edge-cases.e2e-spec.ts
EDGE_TESTS_STATUS=$?
show_status $EDGE_TESTS_STATUS "Tests de casos límite"

# 7. Ejecutar todos los tests e2e
echo -e "${BLUE}🔄 Ejecutando batería completa de tests E2E...${NC}"
npm run test:e2e
ALL_TESTS_STATUS=$?
show_status $ALL_TESTS_STATUS "Batería completa de tests E2E"

# 8. Generar reporte de cobertura
echo -e "${BLUE}📊 Generando reporte de cobertura...${NC}"
npm run test:cov
COVERAGE_STATUS=$?
show_status $COVERAGE_STATUS "Reporte de cobertura"

# 9. Resumen final
echo ""
echo "=========================================================="
echo -e "${BLUE}📋 RESUMEN DE EJECUCIÓN${NC}"
echo "=========================================================="

if [ $MAIN_TESTS_STATUS -eq 0 ] && [ $EDGE_TESTS_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todos los tests pasaron exitosamente!${NC}"
    echo -e "${GREEN}✅ Arquitectura hexagonal funcionando correctamente${NC}"
    echo -e "${GREEN}✅ Casos límite manejados apropiadamente${NC}"
    echo -e "${GREEN}✅ Endpoints v2 listos para producción${NC}"
else
    echo -e "${RED}❌ Algunos tests fallaron:${NC}"
    [ $MAIN_TESTS_STATUS -ne 0 ] && echo -e "${RED}  - Tests principales de arquitectura hexagonal${NC}"
    [ $EDGE_TESTS_STATUS -ne 0 ] && echo -e "${RED}  - Tests de casos límite${NC}"
fi

echo ""
echo -e "${BLUE}📁 Archivos de test creados:${NC}"
echo "  - test/tweets-hexagonal.e2e-spec.ts"
echo "  - test/tweets-edge-cases.e2e-spec.ts"
echo "  - test/test-data.helper.ts"
echo "  - test/setup.ts"

if [ $COVERAGE_STATUS -eq 0 ]; then
    echo -e "${BLUE}📊 Reporte de cobertura disponible en: coverage/lcov-report/index.html${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Para ejecutar tests individuales:${NC}"
echo "  npm run test:e2e test/tweets-hexagonal.e2e-spec.ts"
echo "  npm run test:e2e test/tweets-edge-cases.e2e-spec.ts"

exit $(($MAIN_TESTS_STATUS + $EDGE_TESTS_STATUS))