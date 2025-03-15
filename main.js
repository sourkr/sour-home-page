document.getElementById("apps").addEventListener('click', async () => {
  const url = prompt("Enter Website Domain Name")
  
  if (url == null || url == '') return
  
  if (!/\w+\.\w+(\.\w+)?/.test(url)) return
  
  const img = `http://www.google.com/s2/favicons?domain=${url}&sz=128`
  const name = await fetchWebsiteTitle('https://www.google.com')
  const uri = `https://${url}`
  
  addApp(img, name, uri)
  saveApp(name, img, uri)
})

async function fetchWebsiteTitle(domain) {
  const url = `https://opengraph.io/api/1.1/site/${encodeURIComponent(domain)}?app_id=0c253682-e5d9-4402-b0e4-22933b6a92fe`;

  try {
    const response = await fetch(url);
    const data = await response.json();
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
}

function saveApp(name, icon, url) {
  if (!localStorage.getItem('apps')) {
    localStorage.setItem('apps', '[]')
  }
  
  const apps = JSON.parse(localStorage.getItem('apps'))
  
  apps.push({ name, icon, url })
  
  localStorage.setItem('apps', JSON.stringify(apps))
}

if (localStorage.getItem('apps')) {
  const apps = JSON.parse(localStorage.getItem('apps'))
  
  apps.forEach(app => {
    addApp(app.icon, app.name, app.url)
  })
}