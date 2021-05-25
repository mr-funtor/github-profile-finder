//don't forget pull requests turns to pulls
//don't forget to change the token

const time= new Date();
const theMonth=time.getMonth();
const presentYear=time.getFullYear();
const presentDay=time.getDate();
const monthsArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
// let updateTime="2021-04-13T21:47:21Z"


//THIS PUTS THE CORRECT TIME FORMAT FOR WHEN A REPO WAS LAST UPDATED

function checkTiming(updateTime){
	
	let repoYear=updateTime.slice(0,4);
	let repoMonth=updateTime.slice(5,7);
	let repoDay=updateTime.slice(8,10);
	
	if(Number(repoYear)<presentYear){
		//this format is for when repo was updated years before
		
		return `Updated on ${repoDay} ${monthsArray[Number(repoMonth)]} ${repoYear}`
		
	}else if(Number(repoYear)===presentYear && Number(repoMonth)===theMonth+1){
		//all these are for when the repository was updated in the same month 
		let daysPassed=presentDay-Number(repoDay);
		
		if(daysPassed===0){
			return `Updated today`
		}else if(daysPassed===1){
			return `Updated yesterday`
		}
		
		return `Updated ${daysPassed} days ago`
		
	}else{
		//if the repo was updated months prior
		return `Updated on ${repoDay} ${monthsArray[Number(repoMonth)]}`
	}
}

//CHANGE THE LAYOUT OF THE PAGE FROM WHAT IT LOOKS LIKE IN HOME SCREEN;
const hiddenHomeItems=document.querySelectorAll('.homer');
function changeLayout(){
	
}

//FETCHS DATA FROM THE API
const mainSearch= document.querySelectorAll('.main-search');
const screenLoadingPage= document.querySelector('.screen-loader');//grabs the entire screen loadin page
const homeScreen= document.querySelector('.home-screen');//grabs the entire screen loadin page
let presentProfile;
// let shownData=[]

mainSearch.forEach((search)=>{
	search.addEventListener('keydown',checkUser)
})


function checkUser(e){
	
	if(e.keyCode===13){
		
		if(e.currentTarget.value.length===0)return showDialogue('no name was searched')//stops the event if nothing was typed
		if(e.currentTarget.value===presentProfile)return showDialogue('Same profile as before')//crosschecks if the profile is what was just typed
		presentProfile=e.currentTarget.value
		
		screenLoadingPage.classList.remove('inactive');//displays the loading screen pending the fetched data
		
		
		let url="https://api.github.com/graphql";
		
		let newUser=e.currentTarget.value.toLowerCase();//picks out the username from the from input
		
			//setup the query for the GRAPHql
	const query={
			"query":`
		query{ 
		  
		 user (login:"${newUser}") {
			id
			name
			login
			bio
			avatarUrl(size:1000)
			repositories(first:20) {
				totalCount
			  edges {
				node {
				  id
				  name
				  description
				  forkCount
				  primaryLanguage {
					name
					color
				  }
				  updatedAt
				  stargazerCount
				}
			  }
			}
		  }
		}`
		};
		
		
			let h = new Headers();
			h.append("Content-Type", "application/json");
			// let encoded=window.btoa("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");
			let auth= "bearer " + "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";
			h.append('Authorization', auth);
			
			console.log(auth);
			
			let req= new Request(url,{
				method:'POST',
				headers:h,
				credentials:'same-origin',
				body: JSON.stringify(query)
			});
			
			fetch(req)
			.then(response => response.json())
		.then((data)=>{
			// console.log(JSON.stringify(data));
			// let newData=JSON.stringify(data).replace('null', '\"wee\"')
			const newData=JSON.stringify(data);
			const changedData=JSON.parse(newData);
			
			updatePage(changedData)//calls the function that changes the profile
			showRepositories(changedData,'profile')//this sieves the data to know if it's all respositories or a single
			// shownData={...changedData}
			
			//this changes the layout of the page from what it looks like on the home screen
			hiddenHomeItems.forEach((item)=>{
				item.classList.remove('home')//readds top icons
				
				if(item.classList.contains('home-tune')){
					item.classList.remove('home-tune')//restores the format top nav 
				}
			})
		
			homeScreen.classList.add('home')//removes the msg and input on the home screen
			
			screenLoadingPage.classList.add('inactive');//removes the loading screen
			console.log(changedData.data.user.repositories.edges)
		})
		.catch((err)=>{
			// console.log(err)
			screenLoadingPage.classList.add('inactive');//removes the loading screen
			showDialogue('No user found')
		});
		
	}
	
}

// INSERT DATA FROM API
const mainAvatar= document.querySelector('.profile-avatar');//grabs the main profile picture
const miniAvi= document.querySelectorAll('.mini-avatar');//grabs the smaller profile pictures
const miniAviName= document.querySelector('.mini-avatar-name');
const profileName= document.querySelector('.profile-name');//grabs the profile name
const loginName= document.querySelector('.login-name');
const profileBio= document.querySelector('.profile-bio');
const totalRepDisplays= document.querySelectorAll('.total-repositories');
const respositoriesWrapper= document.querySelector('.respositories-wrapper');
const searchRepositoriesDisp=document.querySelector('.respositories-number');

//THIS UPDATES THE PROFILE AND REPOSITORIES COUNT
function updatePage(rData){
	console.log('in here')
	//this changes the pictures
	mainAvatar.src=rData.data.user.avatarUrl;
	miniAvi.forEach((avi)=>{
		avi.src=rData.data.user.avatarUrl;
	})
	
	//this changes the Profile details
	profileName.innerText=rData.data.user.name;//the name
	miniAviName.innerText=rData.data.user.name;//the name
	loginName.innerText=rData.data.user.login;//login name
	profileBio.innerText=rData.data.user.bio;//the users bio
	
	//input the total number of repositories the user has
	let totalRepoLength=rData.data.user.repositories.totalCount//checks the length of all repos
	totalRepDisplays.forEach((repDisplay)=>{
		repDisplay.innerText=totalRepoLength //inputs it into the DOM
	})
	
	//input the total number of repositories showing
	let searchedLength=rData.data.user.repositories.edges.length
	searchRepositoriesDisp.innerText=`${searchedLength} results for public repositories`
}

//SIEVES THE REPOSITORIES 
function showRepositories(rData,hook){
		console.log('here here')
		let fullReposit;
		
		//the use of a hook here is for the program to know if it's a single/all the repos that is searched for
	if(hook==='singleRepo'){
		fullReposit=[rData.data.user.repository]//the single repository searched for
	}else{
		fullReposit=rData.data.user.repositories.edges//all the repositories the user has
	}
	
	respositoriesWrapper.innerHTML=''//removes previous repositories in the DOM
	
	fullReposit.map((repository)=>{
		if(hook==='singleRepo'){
			repDomUpdate(repository)//this function updates the repo to the DOM with the data
		}else{
			repDomUpdate(repository.node)
		}	
	})
	
}

//UPDATES THE REPOSITORIES SECTION IN THE DOM

function repDomUpdate(repoData){
	
	let {name,description,forkCount,primaryLanguage,
		updatedAt,stargazerCount}=repoData;
	
	if(primaryLanguage===null)primaryLanguage={name:'none'}//this prevents a bug where primaryLanguage returns null
	
	
		
		respositoriesWrapper.innerHTML+=`<article class="main-respository">
						<header class="main-respository-head">
							<div>
								<h3 class="respository-name">${name}</h3>
								<p>${description}</p>
							</div>
							
							<i class="far fa-star star-click"><span class="the-star">Star</span></i>
						</header>
						
						
						<footer>
							<p ><i class="fas fa-circle " style="color:${primaryLanguage.color};"></i>${primaryLanguage.name}</p>
							<p><i class="far fa-star"></i>${stargazerCount}</p>
							<p><i class="fas fa-code-branch"></i>${forkCount}</p>
							<p>${checkTiming(updatedAt)}</p>
						</footer>
					</article>`


	//makes the stars just created change on click
	const allStar= document.querySelectorAll('.star-click');
	const starWord= document.querySelectorAll('.the-star');
	
	allStar.forEach((star)=>{
		star.addEventListener('click',(e)=>{
			if(!e.currentTarget.classList.contains('starred')){
				e.currentTarget.classList="fas fa-star star-click starred"
				e.currentTarget.firstElementChild.innerText='Unstar'
				return
			}
			e.currentTarget.classList="far fa-star star-click"
			e.currentTarget.firstElementChild.innerText='Star'
			
			
		})
	})
			
}

//DISPLAYING THE DIALOGUE/ERORR BOX
const dialogueBox=document.querySelector('.error-box');

function showDialogue(msg){
	dialogueBox.firstElementChild.innerText=msg;
	dialogueBox.classList.add('active');
	
	setTimeout(()=>{
		dialogueBox.classList.remove('active');
	},2000)
}

//DENYING ACCESS TO SEARCHING REPOSITORY
const repoSearchInput=document.getElementById('repository-search');

repoSearchInput.addEventListener('keydown',denySearch)

function denySearch(e){
	if(e.keyCode===13){
		showDialogue('Access denied')
	}
}

const accessElements=document.querySelectorAll('.access');
accessElements.forEach((elem)=>{
	elem.addEventListener('click',()=>{
		showDialogue('Access denied')
	})
})


//INSERT THE MINI AVATAR AT THE TOP AFTER LONG SCROLL
// const profileNameWrapper= document.querySelector('.profile-name-wrapper');
const miniAviArea=document.querySelector('.mini-avi-area');
const profileAvatar=document.querySelector('.profile-avatar');

const options={

	rootMargin: "1000% 0px -100% 0px",//the takes the observation area to the top outside the viewport
	threshold:1,
}

//this observes and checks if the main avatar is out of the browser
let observer=new IntersectionObserver(avatarCheck, options);
observer.observe(profileAvatar);

function avatarCheck(entries){
	
	entries.forEach((entry)=>{
		// console.log('seen',scrollY);
		
		//here if the MAIN avatar is in the observation area makes the mini avatar show
		if(entry.isIntersecting){
			return miniAviArea.classList.remove('invisible')
		}
		
		//vice versa to the above
		miniAviArea.classList.add('invisible')
		
	})
}
