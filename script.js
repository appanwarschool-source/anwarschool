const supabaseUrl = 'https://nnbfpvitbuxuvohekpdq.supabase.co';
const supabaseKey = 'sb_publishable_aMFzOb3EDRqvkq2DFnHF3Q_FvNMztvC';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// جلب الفصول حسب المعلم
const teacherId = 'TEACHER_ID_HERE'; // يُستبدل حسب تسجيل الدخول
const classSelect = document.getElementById('classSelect');

async function loadClasses(){
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId);

    if(error){
        classSelect.innerHTML = `<option value="">خطأ في تحميل الفصول</option>`;
        return;
    }

    classSelect.innerHTML = '<option value="">اختر الفصل</option>';
    data.forEach(c=>{
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        classSelect.appendChild(opt);
    });
}
loadClasses();

// إضافة سؤال جديد
const addBtn = document.getElementById('addQuestion');
const questionsContainer = document.getElementById('questionsContainer');

addBtn.addEventListener('click', ()=>{
    const div = document.createElement('div');
    div.classList.add('question-card');
    div.innerHTML = `
        <textarea placeholder="اكتب السؤال هنا" class="questionText" required></textarea>
        <input type="text" placeholder="الخيار الأول" class="option">
        <input type="text" placeholder="الخيار الثاني" class="option">
        <input type="text" placeholder="الخيار الثالث" class="option">
        <input type="text" placeholder="الخيار الرابع" class="option">
        <select class="correctOption" required>
            <option value="">اختر الإجابة الصحيحة</option>
            <option value="1">الخيار الأول</option>
            <option value="2">الخيار الثاني</option>
            <option value="3">الخيار الثالث</option>
            <option value="4">الخيار الرابع</option>
        </select>
    `;
    questionsContainer.appendChild(div);
});

// حفظ جميع الأسئلة
const form = document.getElementById('lessonForm');
const msgDiv = document.getElementById('msg');

form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    msgDiv.innerHTML = '';

    const lessonName = document.getElementById('lessonName').value;
    const classId = classSelect.value;

    if(!lessonName || !classId){
        msgDiv.innerHTML = '<p class="error-msg">يرجى ملء اسم الدرس واختيار الفصل.</p>';
        return;
    }

    const questionCards = document.querySelectorAll('.question-card');
    let allQuestions = [];

    for(const card of questionCards){
        const questionText = card.querySelector('.questionText').value;
        const options = Array.from(card.querySelectorAll('.option')).map(o=>o.value);
        const correctAnswer = parseInt(card.querySelector('.correctOption').value);

        if(!questionText || options.includes('') || !correctAnswer){
            msgDiv.innerHTML = '<p class="error-msg">يرجى ملء جميع الحقول لكل الأسئلة.</p>';
            return;
        }

        allQuestions.push({
            teacher_id: teacherId,
            class_id: classId,
            lesson_name: lessonName,
            question_text: questionText,
            options: options,
            correct_answer: correctAnswer
        });
    }

    // رفع الأسئلة
    const { data, error } = await supabase.from('questions').insert(allQuestions);
    if(error){
        msgDiv.innerHTML = `<p class="error-msg">حدث خطأ أثناء الحفظ: ${error.message}</p>`;
    } else {
        msgDiv.innerHTML = '<p class="success-msg">تم حفظ جميع الأسئلة بنجاح!</p>';
        form.reset();
        // إعادة سؤال واحد افتراضي
        questionsContainer.innerHTML = `<h3>الأسئلة:</h3>
        <div class="question-card">
            <textarea placeholder="اكتب السؤال هنا" class="questionText" required></textarea>
            <input type="text" placeholder="الخيار الأول" class="option">
            <input type="text" placeholder="الخيار الثاني" class="option">
            <input type="text" placeholder="الخيار الثالث" class="option">
            <input type="text" placeholder="الخيار الرابع" class="option">
            <select class="correctOption" required>
                <option value="">اختر الإجابة الصحيحة</option>
                <option value="1">الخيار الأول</option>
                <option value="2">الخيار الثاني</option>
                <option value="3">الخيار الثالث</option>
                <option value="4">الخيار الرابع</option>
            </select>
        </div>`;
    }
});
