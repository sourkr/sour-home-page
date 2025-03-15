let appInfoPopup = null

document.getElementById("apps").addEventListener('click', async () => {
  const url = prompt("Enter Website Domain Name")
  
  if (url == null || url == '') return
  
  if (!/\w+\.\w+(\.\w+)?/.test(url)) return
  
  const img = `http://www.google.com/s2/favicons?domain=${url}&sz=128`
  const name = await fetchWebsiteTitle('https://' + url)
  const uri = `https://${url}`
  
  addApp(img, name, uri)
  saveApp(name, img, uri)
})

async function fetchWebsiteTitle(domain) {
  const url = `https://opengraph.io/api/1.1/site/${encodeURIComponent(domain)}?app_id=0c253682-e5d9-4402-b0e4-22933b6a92fe`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
    return data.hybridGraph.site_name || data.hybridGraph.title;
  } catch (error) {
    console.error(error);
    return 'Untitled'
  }
}

function addApp(imgSrc, title, url) {
  const app = document.createElement('a')
  const img = document.createElement('img')
  const name = document.createElement('span')
  
  app.classList.add('app')
  app.href = url
  
  img.src = imgSrc
  name.innerText = title
  
  app.append(img, name)
  
  document.getElementById('grid').append(app)
  
  app.addEventListener('contextmenu', ev => {
    ev.preventDefault()
    ev.stopPropagation()
    app.classList.add('popup')
    app.style.anchorName = '--app-popup'
    document.getElementById('app-info').style.display = 'block'
    document.getElementById('rect').style.display = 'block'
    appInfoPopup = app
    
    document.getElementById('app-remove').onclick = () => {
      // alert('delete')
      let apps = JSON.parse(localStorage.getItem('apps'))
      apps = apps.filter(app => app.url != url)
      localStorage.setItem('apps', JSON.stringify(apps))
      app.remove()
      closePopup()
    }
  })
}

function saveApp(name, icon, url) {
  if (!localStorage.getItem('apps')) {
    localStorage.setItem('apps', '[]')
  }
  
  const apps = JSON.parse(localStorage.getItem('apps'))
  const index = 
  
  apps.push({ name, icon, url })
  
  localStorage.setItem('apps', JSON.stringify(apps))
}

if (localStorage.getItem('apps')) {
  const apps = JSON.parse(localStorage.getItem('apps'))
  
  apps.forEach(app => {
    addApp(app.icon, app.name, app.url)
  })
}


// document.onlong

// long press
let timer;

function onlongclick(ev) {
  // ev.preventDefault()
  // console.log(ev.target.dispatchEvent)
  ev.target.dispatchEvent(new CustomEvent('longclick', { data: { touchStartEvent: ev } }))
}

function startPress(ev) {
  if (appInfoPopup && !document.getElementById('app-info').contains(ev.target)) {
    closePopup()
    ev.stopPropagation()
  }
  
  timer = setTimeout(() => onlongclick(ev), 700)
}

function closePopup() {
  appInfoPopup.classList.remove('popup')
  appInfoPopup.style.anchorName = 'none'
  document.getElementById('app-info').style.display = 'none'
  document.getElementById('rect').style.display = 'none'
  appInfoPopup = null
}

function cancelPress() {
  clearTimeout(timer);
}

// Mouse Events
document.addEventListener("mousedown", startPress);
document.addEventListener("mouseup", cancelPress);
document.addEventListener("mouseleave", cancelPress);

// Touch Events (for mobile)
document.addEventListener("touchstart", startPress);
document.addEventListener("touchend", cancelPress);
document.addEventListener("touchmove", cancelPress);

document.getElementById('grid').addEventListener('contextmenu', ev => {
  document.body.classList.add('edit')
})

// document

document.getElementById('wallpaper').addEventListener('click', () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*"; // Only allow image files
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      convertToBase64(file);
    }
  };
  
  input.click();
})

function convertToBase64(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const url = e.target.result;
    document.body.style.backgroundImage = `url(${url})`
    localStorage.setItem('wallpaper', url)
  };
  reader.readAsDataURL(file);
}

if (localStorage.getItem('wallpaper')) {
  document.body.style.backgroundImage = `url(${localStorage.getItem('wallpaper')})`
}

document.body.addEventListener('click', ev => {
  if (document.body.classList.contains('edit')) {
    document.body.classList.remove('edit')
    // ev.preventDefault()
    // alert('ser')
  }
})