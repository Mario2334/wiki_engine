const myext = function () {
    var myext1 = {
        type:'lang',
        regex:"\\[\\[([^\\]\[\\r\\n]*)\\]\\]",
        replace:"<a href='$1'>$1</a>"
    }
    return myext1
}

//TODO Implement extension in backend
const live_preview = (event)=>{
    let text = event.target.value;
    preview_data(text)
}
let preview_data = (text)=>{
    //Previews Data for live preview
    let axios=window.axios
    axios.post('/livePreview',{
        text:text
    }).then(res =>{
        let preview = document.getElementById("preview");
        console.log(res.data)
        preview.innerHTML = res.data
    }).catch(reason =>console.log(reason));
}

let submit_edit_page = (event,page)=>{
    //Submits Edit Page Method : POST
    let title = document.getElementById("title").value;
    let describe = document.getElementById("describe").value;
    let html = document.getElementById("editor").value;
    let req_data= {
        title:title,
        describe:describe,
        html:html
    }
    let post_submit=window.axios.post(url='/'+"page"+'/'+page+'/savePage',data=req_data);
    post_submit.then(res =>{
        window.location.href="/page"+"/"+page;
    });
}

let image_upload = (event)=>{
    //Uploads Image as multi form data
    let file_element = document.getElementById("image-upload")
    let files = file_element.files;
    if(files.length>0){
        let image_file = files[0]
        let formData = new FormData();
        formData.append("image",image_file);
        let axios = window.axios;
        axios.post('/page/upload_image',formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(()=>{
            alert("uploaded " + image_file.name+"\nurl:/images/"+image_file.name)
        }).catch(reason => {
            alert(reason)
        })
    }
    else {
        alert("No Image Input")
    }
}

let change_placeholder = (event)=>{
    let file_element = event.target
    if(file_element.files.length > 0){
        document.getElementById("image-label").innerText = file_element.files[0].name
    }
    else {
        document.getElementById("image-label").innerText = "Choose file"
    }
}

let on_click_search = ()=>{
    let search_element = document.getElementById("search");
    let text = search_element.value;
    window.location.href = "/search?text="+text;
}

window.onload = ()=>{
    let search_element = document.getElementById("search");
    search_element.addEventListener("keyup",(event)=>{
        if (event.keyCode === 13) {
            event.preventDefault()
            on_click_search();
        }
    })
}
