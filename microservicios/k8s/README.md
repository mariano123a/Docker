# Kubernetes y monitoreo de microservicios

Despliegue local de la semana 11: Usuarios, Productos y Pedidos con dos réplicas por API, una base de datos independiente por servicio y volúmenes persistentes. El monolito conserva su configuración anterior y no participa en este clúster.

## Primera preparación

Ejecutar desde Ubuntu, con Docker Desktop abierto:

```bash
cd ~/proyecto-monolito-microservicios/microservicios
minikube start --driver=docker --memory=8192 --cpus=4
minikube image build -t usuarios:v1 ./usuarios
minikube image build -t productos:v1 ./productos
minikube image build -t pedidos:v1 ./pedidos
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic db-credentials \
  --from-literal=usuarios-user=usuarios_user \
  --from-literal=usuarios-password=usuarios123 \
  --from-literal=productos-user=productos_user \
  --from-literal=productos-password=productos123 \
  --from-literal=pedidos-user=pedidos_user \
  --from-literal=pedidos-password=pedidos123 \
  -n microservicios --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/bases-datos.yaml
kubectl apply -f k8s/microservicios.yaml
kubectl wait --for=condition=Ready pod --all -n microservicios --timeout=180s
./iniciar.sh
```

Las credenciales anteriores son las de demostración de la guía. Los Secrets se crean en el clúster y los manifiestos de las bases de datos y API hacen referencia a ellos.

Los ConfigMaps incluyen los SQL del proyecto. PostgreSQL los ejecuta solamente al inicializar un volumen vacío; volver a aplicar el ConfigMap no elimina ni reinicializa una base existente.

## Uso habitual

```bash
cd ~/proyecto-monolito-microservicios/microservicios
./iniciar.sh       # Arranca el clúster y los accesos supervisados
./iniciar.sh stop  # Detiene los accesos y Minikube, conserva los volúmenes
```

El script presupone que la primera preparación ya se completó. Mantener la terminal abierta durante la demostración.

- Usuarios: http://localhost:3101/usuarios
- Productos: http://localhost:3102/productos
- Pedidos: http://localhost:3103/pedidos

Los tres Services también usan NodePort 31001, 31002 y 31003. En Docker sobre WSL se puede obtener un acceso alternativo con `minikube service usuarios -n microservicios --url`, manteniendo abierto ese proceso. Los accesos del script usan puertos estables y se reconectan cuando se pierde el Pod seleccionado. Puede existir una interrupción breve mientras se reconecta el port-forward; no es una garantía de disponibilidad continua.

## Prometheus y Grafana

Helm 3 instalado; versión probada del chart: 92.14.0.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --version 92.14.0 --namespace monitoring --create-namespace
kubectl wait --for=condition=Ready pod --all -n monitoring --timeout=600s
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

En otra terminal, consultar la contraseña generada:

```bash
kubectl get secret -n monitoring monitoring-grafana \
  -o jsonpath='{.data.admin-password}' | base64 --decode
echo
```

Entrar en http://localhost:3000 con usuario `admin`. Abrir **Kubernetes / Compute Resources / Namespace (Pods)** y seleccionar el namespace **microservicios**. Hay métricas de CPU, memoria y red. Los porcentajes basados en requests/limits pueden mostrar `No data` porque los manifiestos de la guía no establecen esas cuotas.

Después de detener y volver a iniciar Minikube, volver a abrir el port-forward de Grafana. La instalación Helm permanece en el clúster.

## Comprobaciones realizadas

- Nodo Minikube Ready; seis Pods de API y tres de PostgreSQL listos.
- Tres PVC de 1 GiB en estado Bound.
- Tres rutas `/health` correctas y tres registros iniciales por API.
- Eliminación y reemplazo de Pods de Usuarios; NodePort operativo.
- Ciclo completo de detener e iniciar mediante `iniciar.sh`.
- 600 consultas GET correctas, repartidas en 200 por API.
- Pedido válido: HTTP 201. Referencias inexistentes: HTTP 400. Registro temporal eliminado tras probar.
- Eliminación de un Pod de Pedidos y recuperación automática de las dos réplicas y del acceso 3103.
- Stack de monitoreo operativo y métricas del namespace consultadas en Prometheus/Grafana.

El archivo `validacion.json` conserva el resultado de las consultas y la prueba final de reemplazo. La captura `evidencias/grafana.png` muestra el consumo de memoria observado.
