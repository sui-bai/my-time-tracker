const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        // --- 响应式数据 ---
        const categories = ['学习', '工作', '运动', '娱乐', '杂事'];
        const logs = ref(JSON.parse(localStorage.getItem('time_audit_logs') || '[]'));
        const newItem = ref({ title: '', hours: 1, category: '学习' });
        let myChart = null;

        // --- 计算属性 ---
        const totalLearningHours = computed(() => {
            return logs.value
                .filter(l => l.category === '学习')
                .reduce((sum, l) => sum + Number(l.hours), 0);
        });

        const progressPercent = computed(() => {
            const percent = (totalLearningHours.value / 120) * 100;
            return percent > 100 ? 100 : percent.toFixed(1);
        });

        const recentLogs = computed(() => {
            return [...logs.value].reverse().slice(0, 6);
        });

        // --- 方法 ---
        const addItem = () => {
            if (!newItem.value.title || newItem.value.hours <= 0) {
                alert("请输入有效的任务名称和时长");
                return;
            }
            
            const entry = {
                id: Date.now(),
                ...newItem.value,
                date: new Date().toLocaleDateString()
            };

            logs.value.push(entry);
            saveData();
            
            // 重置输入
            newItem.value.title = '';
            newItem.value.hours = 1;
            
            // 更新图表
            updateChart();
        };

        const saveData = () => {
            localStorage.setItem('time_audit_logs', JSON.stringify(logs.value));
        };

        const resetData = () => {
            if(confirm("确定要删除所有记录吗？此操作不可逆。")) {
                logs.value = [];
                saveData();
                updateChart();
            }
        };

        const exportData = () => {
            const dataStr = JSON.stringify(logs.value, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `time-audit-${new Date().toLocaleDateString()}.json`;
            link.click();
        };

        const getBadgeClass = (cat) => {
            const base = "px-2 py-1 rounded-md text-[10px] font-bold ";
            if (cat === '学习') return base + "bg-indigo-100 text-indigo-600";
            if (cat === '工作') return base + "bg-emerald-100 text-emerald-600";
            if (cat === '娱乐') return base + "bg-rose-100 text-rose-600";
            return base + "bg-slate-100 text-slate-600";
        };

        const updateChart = () => {
            const ctx = document.getElementById('timeChart').getContext('2d');
            
            // 按分类汇总时间
            const summary = {};
            categories.forEach(c => summary[c] = 0);
            logs.value.forEach(l => {
                if(summary[l.category] !== undefined) summary[l.category] += Number(l.hours);
            });

            if (myChart) myChart.destroy();

            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(summary),
                    datasets: [{
                        data: Object.values(summary),
                        backgroundColor: [
                            '#6366f1', // 学习 - Indigo
                            '#10b981', // 工作 - Emerald
                            '#f59e0b', // 运动 - Amber
                            '#ef4444', // 娱乐 - Rose
                            '#94a3b8'  // 杂事 - Slate
                        ],
                        hoverOffset: 20,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                    },
                    cutout: '75%'
                }
            });
        };

        onMounted(() => {
            updateChart();
        });

        return { 
            categories, logs, newItem, addItem, 
            totalLearningHours, progressPercent, recentLogs,
            resetData, exportData, getBadgeClass
        };
    }
}).mount('#app');
