{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const \{ createApp, ref, computed, onMounted \} = Vue;\
\
createApp(\{\
    setup() \{\
        // --- \uc0\u21709 \u24212 \u24335 \u25968 \u25454  ---\
        const categories = ['\uc0\u23398 \u20064 ', '\u24037 \u20316 ', '\u36816 \u21160 ', '\u23089 \u20048 ', '\u26434 \u20107 '];\
        const logs = ref(JSON.parse(localStorage.getItem('time_audit_logs') || '[]'));\
        const newItem = ref(\{ title: '', hours: 1, category: '\uc0\u23398 \u20064 ' \});\
        let myChart = null;\
\
        // --- \uc0\u35745 \u31639 \u23646 \u24615  ---\
        const totalLearningHours = computed(() => \{\
            return logs.value\
                .filter(l => l.category === '\uc0\u23398 \u20064 ')\
                .reduce((sum, l) => sum + Number(l.hours), 0);\
        \});\
\
        const progressPercent = computed(() => \{\
            const percent = (totalLearningHours.value / 120) * 100;\
            return percent > 100 ? 100 : percent.toFixed(1);\
        \});\
\
        const recentLogs = computed(() => \{\
            return [...logs.value].reverse().slice(0, 6);\
        \});\
\
        // --- \uc0\u26041 \u27861  ---\
        const addItem = () => \{\
            if (!newItem.value.title || newItem.value.hours <= 0) \{\
                alert("\uc0\u35831 \u36755 \u20837 \u26377 \u25928 \u30340 \u20219 \u21153 \u21517 \u31216 \u21644 \u26102 \u38271 ");\
                return;\
            \}\
            \
            const entry = \{\
                id: Date.now(),\
                ...newItem.value,\
                date: new Date().toLocaleDateString()\
            \};\
\
            logs.value.push(entry);\
            saveData();\
            \
            // \uc0\u37325 \u32622 \u36755 \u20837 \
            newItem.value.title = '';\
            newItem.value.hours = 1;\
            \
            // \uc0\u26356 \u26032 \u22270 \u34920 \
            updateChart();\
        \};\
\
        const saveData = () => \{\
            localStorage.setItem('time_audit_logs', JSON.stringify(logs.value));\
        \};\
\
        const resetData = () => \{\
            if(confirm("\uc0\u30830 \u23450 \u35201 \u21024 \u38500 \u25152 \u26377 \u35760 \u24405 \u21527 \u65311 \u27492 \u25805 \u20316 \u19981 \u21487 \u36870 \u12290 ")) \{\
                logs.value = [];\
                saveData();\
                updateChart();\
            \}\
        \};\
\
        const exportData = () => \{\
            const dataStr = JSON.stringify(logs.value, null, 2);\
            const blob = new Blob([dataStr], \{ type: "application/json" \});\
            const url = URL.createObjectURL(blob);\
            const link = document.createElement("a");\
            link.href = url;\
            link.download = `time-audit-$\{new Date().toLocaleDateString()\}.json`;\
            link.click();\
        \};\
\
        const getBadgeClass = (cat) => \{\
            const base = "px-2 py-1 rounded-md text-[10px] font-bold ";\
            if (cat === '\uc0\u23398 \u20064 ') return base + "bg-indigo-100 text-indigo-600";\
            if (cat === '\uc0\u24037 \u20316 ') return base + "bg-emerald-100 text-emerald-600";\
            if (cat === '\uc0\u23089 \u20048 ') return base + "bg-rose-100 text-rose-600";\
            return base + "bg-slate-100 text-slate-600";\
        \};\
\
        const updateChart = () => \{\
            const ctx = document.getElementById('timeChart').getContext('2d');\
            \
            // \uc0\u25353 \u20998 \u31867 \u27719 \u24635 \u26102 \u38388 \
            const summary = \{\};\
            categories.forEach(c => summary[c] = 0);\
            logs.value.forEach(l => \{\
                if(summary[l.category] !== undefined) summary[l.category] += Number(l.hours);\
            \});\
\
            if (myChart) myChart.destroy();\
\
            myChart = new Chart(ctx, \{\
                type: 'doughnut',\
                data: \{\
                    labels: Object.keys(summary),\
                    datasets: [\{\
                        data: Object.values(summary),\
                        backgroundColor: [\
                            '#6366f1', // \uc0\u23398 \u20064  - Indigo\
                            '#10b981', // \uc0\u24037 \u20316  - Emerald\
                            '#f59e0b', // \uc0\u36816 \u21160  - Amber\
                            '#ef4444', // \uc0\u23089 \u20048  - Rose\
                            '#94a3b8'  // \uc0\u26434 \u20107  - Slate\
                        ],\
                        hoverOffset: 20,\
                        borderWidth: 0\
                    \}]\
                \},\
                options: \{\
                    responsive: true,\
                    maintainAspectRatio: false,\
                    plugins: \{\
                        legend: \{ position: 'bottom', labels: \{ usePointStyle: true, padding: 20 \} \}\
                    \},\
                    cutout: '75%'\
                \}\
            \});\
        \};\
\
        onMounted(() => \{\
            updateChart();\
        \});\
\
        return \{ \
            categories, logs, newItem, addItem, \
            totalLearningHours, progressPercent, recentLogs,\
            resetData, exportData, getBadgeClass\
        \};\
    \}\
\}).mount('#app');}