const { createApp, ref, computed, onMounted, nextTick } = Vue;

createApp({
    setup() {
        const categories = ref(JSON.parse(localStorage.getItem('time_cats') || '["学习", "工作", "运动", "休息", "杂事"]'));
        const events = ref(JSON.parse(localStorage.getItem('time_events') || '[]'));
        const goals = ref(JSON.parse(localStorage.getItem('time_goals') || '[]'));
        
        const newGoal = ref({ name: '', target: 120, category: '学习' });
        const newCatName = ref('');
        const showCatModal = ref(false);
        let calendar = null;
        let chart = null;

        // --- 核心审计逻辑：计算每个种类的总小时 ---
        const auditData = computed(() => {
            const data = {};
            categories.value.forEach(c => data[c] = 0);
            events.value.forEach(e => {
                const duration = (new Date(e.end) - new Date(e.start)) / (1000 * 60 * 60);
                if (data[e.category] !== undefined) data[e.category] += duration;
            });
            return data;
        });

        // --- 目标进度计算 ---
        const getGoalProgress = (goal) => {
            const current = auditData.value[goal.category] || 0;
            const percent = Math.min((current / goal.target) * 100, 100).toFixed(1);
            return { current: current.toFixed(1), percent };
        };

        // --- 日历初始化 ---
        const initCalendar = () => {
            const calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'timeGridWeek',
                headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' },
                editable: true,
                selectable: true,
                slotDuration: '00:30:00',
                events: events.value,
                
                // 选择时间段添加项目
                select: function(info) {
                    const title = prompt('请输入项目名称:');
                    if (title) {
                        const cat = prompt(`请输入分类 (${categories.value.join('/')}):`, categories.value[0]);
                        if (categories.value.includes(cat)) {
                            const newEvt = {
                                id: String(Date.now()),
                                title: title,
                                start: info.startStr,
                                end: info.endStr,
                                category: cat,
                                backgroundColor: getCatColor(cat)
                            };
                            calendar.addEvent(newEvt);
                            events.value.push(newEvt);
                            saveAndRefresh();
                        } else { alert('分类不存在！'); }
                    }
                    calendar.unselect();
                },
                // 拖拽已有项目
                eventChange: function(info) {
                    const idx = events.value.findIndex(e => e.id === info.event.id);
                    if (idx > -1) {
                        events.value[idx].start = info.event.startStr;
                        events.value[idx].end = info.event.endStr;
                        saveAndRefresh();
                    }
                },
                // 点击删除
                eventClick: function(info) {
                    if (confirm('删除此日程？')) {
                        info.event.remove();
                        events.value = events.value.filter(e => e.id !== info.event.id);
                        saveAndRefresh();
                    }
                }
            });
            calendar.render();
        };

        const updateChart = () => {
            const ctx = document.getElementById('timeChart').getContext('2d');
            if (chart) chart.destroy();
            chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(auditData.value),
                    datasets: [{
                        data: Object.values(auditData.value),
                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#94a3b8']
                    }]
                },
                options: { maintainAspectRatio: false }
            });
        };

        // --- 持久化 ---
        const saveAndRefresh = () => {
            localStorage.setItem('time_events', JSON.stringify(events.value));
            localStorage.setItem('time_cats', JSON.stringify(categories.value));
            localStorage.setItem('time_goals', JSON.stringify(goals.value));
            updateChart();
        };

        const addGoal = () => {
            if (!newGoal.value.name) return;
            goals.value.push({ id: Date.now(), ...newGoal.value });
            newGoal.value = { name: '', target: 120, category: '学习' };
            saveAndRefresh();
        };

        const deleteGoal = (id) => {
            goals.value = goals.value.filter(g => g.id !== id);
            saveAndRefresh();
        };

        // --- 种类管理 ---
        const openCategoryEditor = () => showCatModal.value = true;
        const addCategory = () => {
            if (newCatName.value) {
                categories.value.push(newCatName.value);
                newCatName.value = '';
                saveAndRefresh();
            }
        };
        const removeCategory = (idx) => {
            categories.value.splice(idx, 1);
            saveAndRefresh();
        };

        const getCatColor = (cat) => {
            const colors = { "学习": "#6366f1", "工作": "#10b981", "运动": "#f59e0b", "休息": "#ef4444" };
            return colors[cat] || "#94a3b8";
        };

        onMounted(() => {
            initCalendar();
            updateChart();
        });

        return { 
            categories, auditData, goals, newGoal, addGoal, deleteGoal, getGoalProgress,
            showCatModal, newCatName, openCategoryEditor, addCategory, removeCategory 
        };
    }
}).mount('#app');
