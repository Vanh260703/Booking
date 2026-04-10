async function fetchWithRefresh(url) {
    try {
        let res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        // accessToken hết hạn → refresh
        if (res.status === 401) {
            const success = await tryRefresh();

            if (!success) {
                window.location.href = '../Error/401.html';
                return null;
            }

            // gọi lại API ban đầu
            res = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
        }

        // server lỗi
        if (res.status === 500) {
            window.location.href = '../Error/500.html';
            return null;
        }

        return await res.json();

    } catch (err) {
        console.error(err);
        window.location.href = '../Error/500.html';
        return null;
    }
}


async function tryRefresh() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/refresh-token', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await res.json();
        return data.success === true;

    } catch (err) {
        console.error("Refresh failed:", err);
        return false;
    }
}

function showToast(type, message) {
  const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
  });
  Toast.fire({
      icon: type,
      title: message
  });
}
