// JavaScript para página de MTTR
class MTTRPage {
    constructor() {
        // Verificar autenticação primeiro
        if (!this.checkAuth()) {
            return;
        }

        this.user = JSON.parse(localStorage.getItem('user'));
        this.machines = [];
        this.stopsData = [];
        this.mttrData = {};
        this.charts = {};
        this.selectedMachine = 'all';
        this.selectedPeriod = 'month';
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.loadMachines();
        this.updateTimestamp();
        setInterval(() => this.updateTimestamp(), 1000);
    }

    // Função para verificar se usuário está logado
    checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            window.location.href = 'login.html';
            return false;
        }
        
        const userData = JSON.parse(user);
        
        // Verificar se operador está pendente
        if (userData.tipoUsuario === 'operador' && userData.status === 'pendente') {
            this.showPendingMessage();
            return false;
        }
        
        // Verificar se usuário está inativo
        if (userData.status === 'inativo') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }

    // Função para mostrar mensagem de pendência
    showPendingMessage() {
        const statusMessage = document.querySelector('.status-message');
        if (statusMessage) {
            statusMessage.innerHTML = `
                <div style="background: #fef3c7; color: #92400e; padding: 1rem; border-radius: 8px; text-align: center;">
                    <i class="fas fa-clock"></i>
                    Sua conta está aguardando aprovação da empresa.
                </div>
            `;
        }
    }

    // Função para carregar dados do usuário
    loadUserData() {
        const userName = document.querySelector('.username');
        
        if (userName && this.user) {
            userName.textContent = this.user.nome;
        }
    }

    setupEventListeners() {
        // Filtro de máquina
        const machineFilter = document.getElementById('machineFilter');
        if (machineFilter) {
            machineFilter.addEventListener('change', (e) => {
                this.selectedMachine = e.target.value;
                this.loadMTTRData();
            });
        }

        // Filtros de período
        const periodFilter = document.getElementById('periodFilter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.selectedPeriod = e.target.value;
                this.loadMTTRData();
            });
        }

        const chartPeriodFilter = document.getElementById('chartPeriodFilter');
        if (chartPeriodFilter) {
            chartPeriodFilter.addEventListener('change', (e) => {
                this.updateMTTRChart(e.target.value);
            });
        }

        const evolutionPeriodFilter = document.getElementById('evolutionPeriodFilter');
        if (evolutionPeriodFilter) {
            evolutionPeriodFilter.addEventListener('change', (e) => {
                this.updateEvolutionChart(e.target.value);
            });
        }

        const tablePeriodFilter = document.getElementById('tablePeriodFilter');
        if (tablePeriodFilter) {
            tablePeriodFilter.addEventListener('change', (e) => {
                this.updateMTTRTable(e.target.value);
            });
        }

        // Botão de logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Botão de menu mobile
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Fechar sidebar ao clicar fora dela em mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 767) {
                const sidebar = document.querySelector('.sidebar');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (sidebar && sidebar.classList.contains('open') && 
                    !sidebar.contains(e.target) && 
                    !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    // Carregar máquinas
    async loadMachines() {
        try {
            const response = await this.makeAuthenticatedRequest('/api/paradas-maquina/machines');
            
            if (response && response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    this.machines = data.data;
                    this.populateMachineFilter();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar máquinas:', error);
        }
        
        // Carregar dados de MTTR após carregar máquinas
        this.loadMTTRData();
    }

    // Popular filtro de máquinas
    populateMachineFilter() {
        const machineFilter = document.getElementById('machineFilter');
        if (!machineFilter) return;

        // Limpar opções existentes (exceto "Todas as Máquinas")
        machineFilter.innerHTML = '<option value="all">Todas as Máquinas</option>';

        // Adicionar máquinas
        this.machines.forEach(machine => {
            const option = document.createElement('option');
            option.value = machine.machineId;
            option.textContent = machine.machineId;
            machineFilter.appendChild(option);
        });
    }

    // Carregar dados de paradas e calcular MTTR
    async loadMTTRData() {
        try {
            const machineId = this.selectedMachine !== 'all' ? this.selectedMachine : null;
            const period = this.selectedPeriod;
            
            let url = `/api/paradas-maquina?period=${period}`;
            if (machineId) {
                url += `&machineId=${encodeURIComponent(machineId)}`;
            }

            const response = await this.makeAuthenticatedRequest(url);
            
            if (response && response.ok) {
                const data = await response.json();
                this.stopsData = data.data || [];
                
                // Calcular MTTR
                this.calculateMTTR();
                this.updateMetrics();
                await this.updateMTTRTable(this.selectedPeriod);

                const evolutionFilter = document.getElementById('evolutionPeriodFilter');
                const evolutionPeriod = evolutionFilter ? evolutionFilter.value : 'week';
                await this.updateEvolutionChart(evolutionPeriod);
            }
        } catch (error) {
            console.error('Erro ao carregar dados de MTTR:', error);
            this.showNotification('Erro ao carregar dados de MTTR', 'error');
        }
    }

    // Calcular MTTR (Mean Time To Repair)
    // MTTR = Soma de todas as durações de parada / Número de paradas
    calculateMTTR() {
        this.mttrData = this.calculateMttrFromStops(this.stopsData);
    }

    calculateMttrFromStops(stops = []) {
        const mttrResult = {};

        if (!Array.isArray(stops) || stops.length === 0) {
            return mttrResult;
        }
        
        // Agrupar paradas por máquina
        const stopsByMachine = {};
        
        stops.forEach(stop => {
            const machineId = stop.machineId || 'UNKNOWN';
            if (!stopsByMachine[machineId]) {
                stopsByMachine[machineId] = [];
            }
            stopsByMachine[machineId].push(stop);
        });

        // Calcular MTTR para cada máquina
        Object.keys(stopsByMachine).forEach(machineId => {
            const machineStops = stopsByMachine[machineId];
            
            // Ordenar paradas por timestamp
            machineStops.sort((a, b) => {
                const timeA = new Date(a.timestamp || a.createdAt);
                const timeB = new Date(b.timestamp || b.createdAt);
                return timeA - timeB;
            });

            // Calcular tempo total de parada em segundos
            let totalDowntimeSeconds = 0;
            machineStops.forEach(stop => {
                const duration = stop.duration_seconds || stop.duration || 0;
                totalDowntimeSeconds += duration;
            });

            const numStops = machineStops.length;
            const mttrMinutes = numStops > 0 ? (totalDowntimeSeconds / numStops) / 60 : 0;
            const mttrHours = mttrMinutes / 60;

            const lastStop = machineStops[machineStops.length - 1];
            const lastStopTime = lastStop ? new Date(lastStop.timestamp || lastStop.createdAt) : null;

            const totalDowntimeHours = totalDowntimeSeconds / 3600;

            mttrResult[machineId] = {
                mttrMinutes: mttrMinutes,
                mttrHours: mttrHours,
                numStops: numStops,
                totalDowntimeSeconds: totalDowntimeSeconds,
                totalDowntimeHours: totalDowntimeHours,
                lastStop: lastStopTime
            };
        });

        return mttrResult;
    }

    // Atualizar métricas
    updateMetrics() {
        // MTTR Geral (média de todas as máquinas)
        const mttrValues = Object.values(this.mttrData).map(d => d.mttrMinutes).filter(v => v > 0);
        const mttrGeral = mttrValues.length > 0 
            ? mttrValues.reduce((a, b) => a + b, 0) / mttrValues.length 
            : 0;

        document.getElementById('mttrGeral').textContent = 
            mttrGeral > 0 ? `${mttrGeral.toFixed(2)}min` : '--';

        // MTTR da máquina selecionada
        if (this.selectedMachine !== 'all' && this.mttrData[this.selectedMachine]) {
            const machineData = this.mttrData[this.selectedMachine];
            document.getElementById('mttrMaquina').textContent = 
                `${machineData.mttrMinutes.toFixed(2)}min`;
            document.getElementById('machineName').textContent = this.selectedMachine;
        } else {
            document.getElementById('mttrMaquina').textContent = '--';
            document.getElementById('machineName').textContent = 'Selecione uma máquina';
        }

        // Tempo total de parada
        const totalDowntime = Object.values(this.mttrData).reduce((sum, d) => sum + d.totalDowntimeHours, 0);
        const totalDowntimeHours = Math.floor(totalDowntime);
        const totalDowntimeMinutes = Math.floor((totalDowntime - totalDowntimeHours) * 60);
        
        let downtimeText = '';
        if (totalDowntimeHours > 0) {
            downtimeText = `${totalDowntimeHours}h`;
            if (totalDowntimeMinutes > 0) {
                downtimeText += ` ${totalDowntimeMinutes}min`;
            }
        } else {
            downtimeText = `${totalDowntimeMinutes}min`;
        }

        document.getElementById('tempoTotalParada').textContent = 
            totalDowntime > 0 ? downtimeText : '--';

        // Atualizar gráfico
        this.updateMTTRChart(this.selectedPeriod);
    }

    // Atualizar gráfico de MTTR por máquina
    async updateMTTRChart(period) {
        const canvas = document.getElementById('mttrPorMaquinaChart');
        if (!canvas) return;

        const stops = await this.loadMTTRDataForPeriod(period, { updateState: false });
        const mttrData = this.calculateMttrFromStops(stops);

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (this.charts.mttrPorMaquina) {
            this.charts.mttrPorMaquina.destroy();
        }

        const machines = Object.keys(mttrData);
        const mttrValues = machines.map(m => mttrData[m].mttrMinutes);

        this.charts.mttrPorMaquina = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: machines,
                datasets: [{
                    label: 'MTTR (minutos)',
                    data: mttrValues,
                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'MTTR (minutos)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Atualizar gráfico de evolução do MTTR
    async updateEvolutionChart(period) {
        const canvas = document.getElementById('evolucaoMttrChart');
        if (!canvas) return;

        const stops = await this.loadMTTRDataForPeriod(period, { updateState: false });
        const buckets = this.createTimeBuckets(period);

        if (!buckets.length) {
            return;
        }

        const ctx = canvas.getContext('2d');
        const labels = [];
        const mttrValues = [];
        const downtimeValues = [];

        buckets.forEach(bucket => {
            const bucketStops = stops.filter(stop => {
                const timestamp = new Date(stop.timestamp || stop.createdAt);
                return timestamp >= bucket.start && timestamp < bucket.end;
            });

            const machineDurations = {};
            const machineCounts = {};

            bucketStops.forEach(stop => {
                const machineId = stop.machineId || 'UNKNOWN';
                const duration = stop.duration_seconds || stop.duration || 0;

                machineDurations[machineId] = (machineDurations[machineId] || 0) + duration;
                machineCounts[machineId] = (machineCounts[machineId] || 0) + 1;
            });

            const mttrPerMachine = Object.keys(machineDurations).map(machineId => {
                const totalDuration = machineDurations[machineId];
                const failures = machineCounts[machineId] || 0;
                return failures > 0 ? (totalDuration / failures) / 60 : 0;
            });

            const mttrAverage = mttrPerMachine.length > 0
                ? mttrPerMachine.reduce((sum, value) => sum + value, 0) / mttrPerMachine.length
                : 0;

            const totalDowntime = bucketStops.reduce((sum, stop) => {
                const duration = stop.duration_seconds || stop.duration || 0;
                return sum + duration / 60;
            }, 0);

            labels.push(bucket.label);
            mttrValues.push(Number.isFinite(mttrAverage) ? parseFloat(mttrAverage.toFixed(2)) : 0);
            downtimeValues.push(Number.isFinite(totalDowntime) ? parseFloat(totalDowntime.toFixed(2)) : 0);
        });

        if (this.charts.evolucaoMttr) {
            this.charts.evolucaoMttr.destroy();
        }

        const hasMttrData = mttrValues.some(value => value > 0);
        const hasDowntimeData = downtimeValues.some(value => value > 0);

        this.charts.evolucaoMttr = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'MTTR (min)',
                        data: mttrValues,
                        borderColor: 'rgba(245, 158, 11, 1)',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        spanGaps: true
                    },
                    {
                        label: 'Tempo de Parada (min)',
                        data: downtimeValues,
                        type: 'bar',
                        yAxisID: 'y1',
                        backgroundColor: 'rgba(59, 130, 246, 0.35)',
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'MTTR (min)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        },
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tempo de Parada (min)'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

        if (!hasMttrData && !hasDowntimeData) {
            this.showNotification('Sem dados de parada para o período selecionado', 'info');
        }
    }

    createTimeBuckets(period) {
        const now = new Date();
        const buckets = [];

        if (period === 'week') {
            for (let offset = 6; offset >= 0; offset--) {
                const start = new Date();
                start.setHours(0, 0, 0, 0);
                start.setDate(start.getDate() - offset);

                const end = new Date(start);
                end.setDate(end.getDate() + 1);

                buckets.push({
                    start,
                    end: end > now ? new Date(now) : end,
                    label: start.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
                });
            }
        } else if (period === 'month') {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            start.setDate(start.getDate() - 27);

            for (let i = 0; i < 4; i++) {
                const bucketStart = new Date(start);
                bucketStart.setDate(start.getDate() + (i * 7));

                const bucketEnd = new Date(bucketStart);
                bucketEnd.setDate(bucketEnd.getDate() + 7);

                buckets.push({
                    start: bucketStart,
                    end: bucketEnd > now ? new Date(now) : bucketEnd,
                    label: `Semana ${i + 1}`
                });
            }
        } else if (period === 'quarter') {
            const reference = new Date();
            reference.setHours(0, 0, 0, 0);
            reference.setDate(1);
            reference.setMonth(reference.getMonth() - 2);

            for (let i = 0; i < 3; i++) {
                const bucketStart = new Date(reference);
                bucketStart.setMonth(reference.getMonth() + i);

                const bucketEnd = new Date(bucketStart);
                bucketEnd.setMonth(bucketEnd.getMonth() + 1);

                buckets.push({
                    start: bucketStart,
                    end: bucketEnd > now ? new Date(now) : bucketEnd,
                    label: bucketStart.toLocaleDateString('pt-BR', { month: 'short' })
                });
            }
        } else if (period === 'year') {
            const reference = new Date();
            reference.setHours(0, 0, 0, 0);
            reference.setDate(1);
            reference.setMonth(reference.getMonth() - 11);

            for (let i = 0; i < 12; i++) {
                const bucketStart = new Date(reference);
                bucketStart.setMonth(reference.getMonth() + i);

                const bucketEnd = new Date(bucketStart);
                bucketEnd.setMonth(bucketEnd.getMonth() + 1);

                buckets.push({
                    start: bucketStart,
                    end: bucketEnd > now ? new Date(now) : bucketEnd,
                    label: bucketStart.toLocaleDateString('pt-BR', { month: 'short' })
                });
            }
        } else {
            return this.createTimeBuckets('week');
        }

        return buckets;
    }

    // Carregar dados de MTTR para um período específico
    async loadMTTRDataForPeriod(period, options = {}) {
        const { machineId = null, updateState = true } = options;
        try {
            let url = `/api/paradas-maquina?period=${period}`;
            if (machineId) {
                url += `&machineId=${encodeURIComponent(machineId)}`;
            }

            const response = await this.makeAuthenticatedRequest(url);
            
            if (response && response.ok) {
                const data = await response.json();
                const stops = data.data || [];

                if (updateState) {
                    this.stopsData = stops;
                    this.calculateMTTR();
                }

                return stops;
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }

        return [];
    }

    // Atualizar tabela de MTTR
    async updateMTTRTable(period) {
        const stops = await this.loadMTTRDataForPeriod(period, { updateState: false });
        const mttrData = this.calculateMttrFromStops(stops);
        
        const tbody = document.getElementById('mttrTableBody');
        if (!tbody) return;

        if (Object.keys(mttrData).length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <div class="empty-state">
                            <i class="fas fa-info-circle"></i>
                            <h3>Nenhum dado disponível</h3>
                            <p>Não há dados de paradas para calcular o MTTR no período selecionado.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';
        
        Object.keys(mttrData).forEach(machineId => {
            const data = mttrData[machineId];
            const row = document.createElement('tr');
            
            // Status baseado no MTTR (em minutos)
            // MTTR baixo = bom (menos de 30min), MTTR médio = atenção (30-60min), MTTR alto = ruim (>60min)
            let statusBadge = '';
            if (data.mttrMinutes === 0) {
                statusBadge = '<span class="status-badge" style="background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">Excelente</span>';
            } else if (data.mttrMinutes < 30) {
                statusBadge = '<span class="status-badge" style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">Bom</span>';
            } else if (data.mttrMinutes < 60) {
                statusBadge = '<span class="status-badge" style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">Atenção</span>';
            } else {
                statusBadge = '<span class="status-badge" style="background: #fee2e2; color: #991b1b; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">Crítico</span>';
            }

            const lastStopText = data.lastStop 
                ? new Date(data.lastStop).toLocaleString('pt-BR')
                : 'N/A';

            // Formatar tempo total de parada
            const downtimeHours = Math.floor(data.totalDowntimeHours);
            const downtimeMinutes = Math.floor((data.totalDowntimeHours - downtimeHours) * 60);
            let downtimeFormatted = '';
            if (downtimeHours > 0) {
                downtimeFormatted = `${downtimeHours}h`;
                if (downtimeMinutes > 0) {
                    downtimeFormatted += ` ${downtimeMinutes}min`;
                }
            } else {
                downtimeFormatted = `${downtimeMinutes}min`;
            }

            row.innerHTML = `
                <td><strong>${machineId}</strong></td>
                <td>${data.mttrMinutes.toFixed(2)}min</td>
                <td>${data.numStops}</td>
                <td>${downtimeFormatted}</td>
                <td>${statusBadge}</td>
                <td>${lastStopText}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Função auxiliar para fazer requisições autenticadas
    async makeAuthenticatedRequest(url) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return null;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return null;
            }

            return response;
        } catch (error) {
            console.error('Erro na requisição:', error);
            return null;
        }
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        const statusMessage = document.querySelector('.status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `status-message ${type}`;
            statusMessage.classList.add('show');
            
            setTimeout(() => {
                statusMessage.classList.remove('show');
            }, 3000);
        }
    }

    // Atualizar timestamp
    updateTimestamp() {
        const timestamp = document.querySelector('.timestamp');
        if (timestamp) {
            const now = new Date();
            timestamp.textContent = now.toLocaleString('pt-BR');
        }
    }

    // Logout
    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    // Toggle sidebar mobile
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new MTTRPage();
});

