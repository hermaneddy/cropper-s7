

$( document ).ready(function() {
		
		var PSD = require('psd');
		
		document.getElementById('dropzone').addEventListener('dragover', onDragOver, true);
		document.getElementById('dropzone').addEventListener('drop', onDrop, true);

		function loopThroughParents(parentGroups) {
			for (parentGroup = parentGroups.length; parentGroup >= 0; parentGroup--) {
				if (typeof parentGroups[parentGroup] != "undefined") {
					mask = parentGroups[parentGroup].get("mask");
					if (mask.left == 0 && mask.top == 0 && mask.right == 0 && mask.bottom == 0) {
						//continue
					}
					else {
						//break for loop
						console.log("layer mask found!");
						return mask;
					}
				}
			}
		}
		
		function onDragOver(e) {
		  e.stopPropagation();
		  e.preventDefault();
		  e.dataTransfer.dropEffect = 'copy';
		}
		
		function onDrop(e) {
			document.getElementById('dropzone').removeEventListener('drop', onDrop, true);
			$(".preview-image, .cropping-code").detach();
			tips = new Array(
				"Tip: you can switch between liveview and listview by pushing the button in the upper right corner",
				"Tip: you can also switch views by pressing the tab key",
				"Tip: Listview can show you hidden images (e.g. slider images)",
				"Tip: you can reverse the order within the listview by pressing the 'r'-key",
				"If croppings go wrong or something is missing ask a designer to look into this<br />Alternatively, do it yourself",

				"Take a deep breath",
				"Red links show that the cropping might be wrong"
			);
			$(".tip").html(tips[Math.floor(Math.random() * tips.length)]);
			$("#dropzone").animate({"opacity": 0}, 500, function() {
				$("#progress").animate({"opacity": 1}, 1500);
			});
			console.log("start");
			var startTime = Date.now();
	
			e.stopPropagation();
			e.preventDefault();
			
			var result = "<div id='listview'>";
			var preview = "<div id='livepreview'>";
			var seen = {};

			PSD.fromEvent(e).then(function (psd) {
			$('#save').show(10);	
			var data = psd.tree().export();
			//var data = JSON.stringify(psd.tree().export(), undefined, 2);
			nodes = psd.tree().descendants();
			for (n = 0; n < nodes.length; n++) {
				//$("#process > div").animate({"width":progress+"%"}, 100);
				progress = parseInt(n / nodes.length * 100);
				if (nodes[n].name == "img" || nodes[n].name.toLowerCase().indexOf("image") >= 0) {
					// group names that have img, image or slide in their names are accepted
					for (i= 0; i <= nodes[n].descendants().length; i++) {
						if (typeof nodes[n].descendants()[i] != "undefined" && typeof nodes[n].descendants()[i].get("text") == "undefined" && nodes[n].descendants()[i].get("name").toLowerCase().indexOf("rectangle") < 0 && nodes[n].descendants()[i].get("opacity") == 255) {
// loops though all children of the group until it finds a layer that is not text or rectangle // opacity must be 1!
							image = nodes[n].descendants()[i];
						}
					}
					imageName = image.get("name");
					offsetX = image.get("left");
					offsetY = image.get("top");
					width = image.get("width");
					height = image.get("height");
					if (!seen[imageName+"_"+offsetX+"_"+offsetY+"_"+width+"_"+height]) {
						// checks if the image has been handled before
						seen[imageName+"_"+offsetX+"_"+offsetY+"_"+width+"_"+height] = true;
						//console.log("Checking: "+imageName);
						imagePNG = image.toPng().outerHTML;
						
						mask = image.get("mask");
						if (mask.left == 0 && mask.top == 0 && mask.right == 0 && mask.bottom == 0) {
							parentGroups = image.ancestors();
							loopThroughParents(parentGroups);
						}
						maskX = mask.left;
						maskY = mask.top;
						maskWidth = mask.width;
						maskHeight = mask.height;
						
						croppingX = maskX - offsetX;
						croppingY = maskY - offsetY;
						croppingWidth = maskWidth;
						croppingHeight = maskHeight;
						
						croppingXRelative = croppingX / width;
						croppingYRelative = croppingY / height;
						croppingWidthRelative = croppingWidth / width;
						croppingHeightRelative = croppingHeight / height;
						if (croppingX < 0 || croppingY < 0) {
							sthIsWrong = " error";
							$('#save').hide(10);
							$('.reupload').show(10);
						}
						else {
							sthIsWrong = "";
						}
						imageName = imageName.replace(".jpg","");
						preview += "<div class='cropped-image' style='top:"+maskY+"px; left:"+maskX+"px; width:"+croppingWidth+"px; height:"+croppingHeight+"px;'>\n"+
									"<div style='top:-"+croppingY+"px; left:-"+croppingX+"px;'>"+imagePNG+"</div>\n"+
									"<input class='cropping-code"+sthIsWrong+"' value='http://images.hugoboss.com/is/image/boss/"+imageName+"?$marketing_asset$&wid="+croppingWidth+"&hei="+croppingHeight+"&cropN="+croppingXRelative+","+croppingYRelative+","+croppingWidthRelative+","+croppingHeightRelative+"' />\n"+
								"</div>\n";
						result += "<div class='row"+sthIsWrong+"'>\n"+
							"<div class='preview-image'>"+imagePNG+"\n"+
								"<div class='cropped-image' style='top:"+croppingY+"px; left:"+croppingX+"px; width:"+croppingWidth+"px; height:"+croppingHeight+"px;'>\n"+
									"<div style='top:-"+croppingY+"px; left:-"+croppingX+"px;'>"+imagePNG+"</div>\n"+
								"</div>\n"+
							"</div>";
						result += "<input class='cropping-code' value='http://images.hugoboss.com/is/image/boss/"+imageName+"?$marketing_asset$&wid="+croppingWidth+"&hei="+croppingHeight+"&cropN="+croppingXRelative+","+croppingYRelative+","+croppingWidthRelative+","+croppingHeightRelative+"' />\n"+
						"</div>";
						//console.log(progress+"%");
					}
					else {
						//console.log("Skipped '"+imageName+"' because it has been handled before");
					}
				}
				/*if (nodes[n].name == "txt") {
					console.log(nodes[n].get("left"), nodes[n].get("top"), nodes[n].get("width"), nodes[n].get("height")); // masks are also accessable for groups
				} */
			}
			preview += "</div>";
			result += "</div>";

			$("body").append(preview);
			$("body").append(result);
			$("body").append("<div id='view-button'>Liveview</div>");
			var endTime = Date.now();
			var timeDif = (endTime - startTime) / 1000;
			console.log("end: "+timeDif+"s");
			$(".row").animate({"opacity": 1}, 500);
			$("#progress").animate({"opacity": 0}, 50);
			//console.log(data);
			//document.getElementById('data').innerHTML = data;
			//document.getElementById('image').appendChild(psd.image.toPng());
			});
		}

	
	
	$(document).on('click', '.cropping-code', function() {
		$(this).select();
	});
	function changeView() {
		if ($("#view-button").text() == "Liveview") {
			$("#view-button").text("Listview");
			$(".row").show();
			$("#livepreview").hide();
		}
		else {
			$("#view-button").text("Liveview");
			$(".row").hide();
			$("#livepreview").show();
		}
	}
	function reverseOrder() {
		var list = $('#listview');
		var listItems = list.children('.row');
		list.html("");
		list.append(listItems.get().reverse());
	}
	$(document).on('click', '#view-button', function() {
		changeView();
	});






	$('#save').click(function(){


		var arr = [];
		$("#livepreview input.cropping-code").each(function(){
		    arr.push($(this).val() + '<br /><br />');
		});

		$('#link').val(arr.join(' '))

	


    ;})
	
	$('body').on('keydown', function(e) {
		if (e.which == 9) { // tab
			e.preventDefault();
			changeView();
		}
		if (e.which == 82) { // r
			e.preventDefault();
			reverseOrder();
		}
	});
});