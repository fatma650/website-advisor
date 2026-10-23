/** إنشاء كلمة المرور مرة واحدة ثم فتح جلسة آمنة. لا نعيد كلمة المرور في أي استجابة. */
(() => {
  const $=id=>document.getElementById(id);let language='ar',setup=false,busy=false,ready=false,resetting=false,passwordOnly=false,resetAvailable=false;
  try{language=localStorage.getItem('advisor-admin-language')||'ar';}catch{}
  const t=(ar,en)=>language==='ar'?ar:en;
  const errors={admin_not_configured:['إعداد لوحة الإدارة غير مكتمل. راجعي إعدادات الاستضافة.','Admin setup is incomplete. Check your hosting settings.'],reset_unavailable:['خدمة الاستعادة غير مفعّلة بعد.','Password recovery is not configured.'],email_unavailable:['تعذر إرسال كود الاستعادة. حاولي لاحقًا.','Could not send the recovery code. Try later.'],password_short:['استخدمي كلمة مرور من 12 حرفاً على الأقل.','Use at least 12 characters.'],password_incorrect:['كلمة المرور غير صحيحة.','Incorrect password.'],password_invalid:['راجعي كلمة المرور المدخلة.','Check the password you entered.'],too_many_attempts:['محاولات كثيرة. انتظري 15 دقيقة ثم حاولي مجدداً.','Too many attempts. Wait 15 minutes, then try again.'],password_already_set:['تم إنشاء كلمة المرور بالفعل. حدّثي الصفحة لتسجيل الدخول.','A password is already set. Refresh to sign in.'],password_not_set:['حدّثي الصفحة لإنشاء كلمة المرور أولاً.','Refresh the page to set your password first.'],sign_in_required:['سجّلي الدخول بحساب مالك الموقع أولاً.','Sign in with the site owner account first.'],admin_only:['هذا الحساب غير مسموح له بالدخول.','This account is not allowed to access the admin.'],code_incorrect:['كود التحقق غير صحيح أو منتهي الصلاحية.','Incorrect or expired verification code.']};
  function show(error){$('passwordError').textContent=t(...(errors[error.code]||['تعذر الاتصال. حاولي مرة أخرى.','Unable to connect. Please try again.']));$('passwordError').hidden=false;}
  async function api(path,body){const response=await fetch(path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json','X-Advisor-Request':'admin'}:{},body:body?JSON.stringify(body):undefined});let result;try{result=await response.json();}catch{throw {code:'unavailable'};}if(!response.ok)throw {code:result.error};return result;}
  function render(){
    document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';$('passwordLanguage').textContent=language==='ar'?'English':'العربية';
    $('passwordEyebrow').textContent=t('دخول الأدمن','ADMIN ACCESS');
    $('passwordTitle').textContent=!ready?t('جارٍ التحقق…','Checking access…'):resetting?t('استعادة كلمة المرور','Reset your password'):setup?t('اختاري كلمة مرور للأدمن','Set your admin password'):t('أدخلي كلمة المرور','Enter your password');
    $('passwordDescription').textContent=resetting?t('أرسلنا كود تحقق إلى بريدك الإلكتروني. أدخليه لاختيار كلمة مرور جديدة.','We sent a verification code to your email. Enter it to choose a new password.'):setup?t('أول مرة فقط: اختاري كلمة مرور من 12 حرفاً على الأقل لحماية التعديل ورفع الصور.','First time only: choose at least 12 characters to protect editing and uploads.'):passwordOnly?t('أدخلي كلمة مرور الأدمن لفتح لوحة الإدارة.','Enter your admin password to open the dashboard.'):t('يلزم حسابك المصرّح له وكلمة المرور لفتح لوحة الإدارة.','Your authorized account and password are required to open the admin.');
    $('passwordLabel').textContent=t('كلمة المرور','Password');$('confirmLabel').textContent=t('تأكيد كلمة المرور','Confirm password');
    $('passwordSubmit').textContent=busy?t('جارٍ التحقق…','Please wait…'):setup?t('حفظ وفتح اللوحة','Set password & open admin'):t('فتح لوحة الأدمن','Open admin');
    $('passwordForgot').textContent=t('نسيت كلمة المرور؟','Forgot password?');
    $('resetCodeLabel').textContent=t('كود التحقق (من الإيميل)','Verification code');
    $('resetPasswordLabel').textContent=t('كلمة المرور الجديدة','New password');
    $('resetSubmit').textContent=busy?t('جارٍ التحقق…','Please wait…'):t('تغيير كلمة المرور','Change password');
    $('resetCancel').textContent=t('إلغاء','Cancel');
    $('passwordBack').textContent=t('العودة للموقع','Back to site');$('passwordRetry').textContent=t('إعادة المحاولة','Try again');
    $('confirmField').hidden=!setup;$('confirmPassword').required=setup;$('adminPassword').minLength=setup?12:1;$('adminPassword').autocomplete=setup?'new-password':'current-password';
    $('passwordForgot').hidden=setup||resetting||!ready||!resetAvailable;
    $('passwordForm').hidden=resetting||!ready;
    $('resetForm').hidden=!resetting;
    $('passwordSubmit').disabled=busy;$('adminPassword').disabled=busy;$('confirmPassword').disabled=busy;$('passwordLanguage').disabled=busy;
    $('resetSubmit').disabled=busy;$('resetCode').disabled=busy;$('resetPassword').disabled=busy;$('passwordForgot').disabled=busy;$('resetCancel').disabled=busy;
  }
  async function load(){try{const state=await api('/api/admin/password/state');setup=state.setupRequired;passwordOnly=state.passwordOnly;resetAvailable=state.resetAvailable;ready=true;$('passwordError').hidden=true;$('passwordRetry').hidden=true;}catch(error){show(error);$('passwordRetry').hidden=false;}render();}
  $('passwordLanguage').addEventListener('click',()=>{language=language==='ar'?'en':'ar';try{localStorage.setItem('advisor-admin-language',language);}catch{}render();});
  $('passwordRetry').addEventListener('click',load);
  $('passwordForgot').addEventListener('click',async ()=>{
    if(busy)return;busy=true;$('passwordError').hidden=true;render();
    try{await api('/api/admin/password/reset/request',{});resetting=true;busy=false;render();}
    catch(error){show(error);busy=false;render();}
  });
  $('resetCancel').addEventListener('click',()=>{resetting=false;$('passwordError').hidden=true;render();});
  $('resetForm').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const code=$('resetCode').value, newPassword=$('resetPassword').value;
    busy=true;$('passwordError').hidden=true;render();
    try{await api('/api/admin/password/reset/confirm',{code, newPassword});window.location.replace('/admin');}
    catch(error){show(error);busy=false;render();}
  });
  $('passwordForm').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const password=$('adminPassword').value;
    if(setup&&password!==$('confirmPassword').value){$('passwordError').textContent=t('كلمتا المرور غير متطابقتين.','The passwords do not match.');$('passwordError').hidden=false;return;}
    busy=true;$('passwordError').hidden=true;render();
    try{await api('/api/admin/password/'+(setup?'setup':'login'),{password});$('adminPassword').value='';$('confirmPassword').value='';window.location.replace('/admin');}
    catch(error){show(error);busy=false;render();}
  });render();load();
})();
