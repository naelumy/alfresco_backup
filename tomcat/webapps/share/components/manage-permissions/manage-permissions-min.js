(function(){var E=YAHOO.util.Dom;var X=Alfresco.util.encodeHTML,b=Alfresco.util.siteURL;Alfresco.component.ManagePermissions=function(e){Alfresco.component.ManagePermissions.superclass.constructor.call(this,"Alfresco.component.ManagePermissions",e,["button","menu","container","datasource","datatable","paginator","json"]);YAHOO.Bubbling.on("nodeDetailsAvailable",this.onNodeDetailsAvailable,this);YAHOO.Bubbling.on("itemSelected",this.onAuthoritySelected,this);this.deferredReady=new Alfresco.util.Deferred(["onPermissionsLoaded","onNodeDetailsAvailable"],{fn:this.onDeferredReady,scope:this});this.nodeData=null;this.settableRoles=null;this.settableRolesMenuData=null;this.permissions={isInherited:false,inherited:[],current:[]};this.showingAuthorityFinder=false;this.inheritanceWarning=false;return this};YAHOO.extend(Alfresco.component.ManagePermissions,Alfresco.component.Base,{deferredReady:null,nodeData:null,settableRoles:null,settableRolesMenuData:null,permissions:null,sitePermissions:{},showingAuthorityFinder:null,inheritanceWarning:null,options:{nonEditableRoles:["SiteManager"],showGroups:true},onReady:function O(){this.widgets.inherited=Alfresco.util.createYUIButton(this,"inheritedButton",this.onInheritedButton);this.widgets.saveButton=Alfresco.util.createYUIButton(this,"okButton",this.onSaveButton);this.widgets.cancelButton=Alfresco.util.createYUIButton(this,"cancelButton",this.onCancelButton);this._setupDataSources();this._setupDataTables();Alfresco.util.Ajax.request({url:Alfresco.constants.URL_SERVICECONTEXT+"components/people-finder/authority-finder",dataObj:{htmlid:this.id+"-authorityFinder"},successCallback:{fn:this.onAuthorityFinderLoaded,scope:this},failureMessage:this.msg("message.authorityFinderFail"),execScripts:true});if(this.options.site){Alfresco.util.Ajax.request({url:Alfresco.constants.PROXY_URI+"api/sites/"+encodeURIComponent(this.options.site)+"/memberships/",successCallback:{fn:function(f){for(var e=0;e<f.json.length;e++){this.sitePermissions[f.json[e].authority.fullName]=f.json[e].role}},scope:this}})}E.setStyle(this.id+"-body","visibility","visible")},onInheritedButton:function W(h,j){var f=this;if(this.permissions.isInherited&&!this.inheritanceWarning){Alfresco.util.PopupManager.displayPrompt({title:this.msg("message.confirm.inheritance.title"),text:this.msg("message.confirm.inheritance.description"),noEscape:true,buttons:[{text:this.msg("button.yes"),handler:function i(){this.destroy();f.inheritanceWarning=true;f.permissions.isInherited=!f.permissions.isInherited;f._updateInheritedUI()}},{text:this.msg("button.no"),handler:function g(){this.destroy()},isDefault:true}]})}else{this.permissions.isInherited=!this.permissions.isInherited;this._updateInheritedUI()}},_updateInheritedUI:function N(){var e=this.permissions.isInherited;E.removeClass(this.id+"-inheritedButtonContainer","inherited-"+(e?"off":"on"));E.addClass(this.id+"-inheritedButtonContainer","inherited-"+(e?"on":"off"));if(e){E.removeClass(this.id+"-inheritedContainer","hidden")}else{E.addClass(this.id+"-inheritedContainer","hidden")}},onAuthorityFinderLoaded:function V(f){var e=E.get(this.id+"-authorityFinder");if(e){e.innerHTML=f.serverResponse.responseText;this.widgets.authorityFinder=e;this.modules.authorityFinder=Alfresco.util.ComponentManager.get(this.id+"-authorityFinder");this.modules.authorityFinder.setOptions({dataWebScript:Alfresco.constants.URL_SERVICECONTEXT+"components/people-finder/authority-query",viewMode:Alfresco.AuthorityFinder.VIEW_MODE_COMPACT,singleSelectMode:true,minSearchTermLength:0,authorityType:(this.options.showGroups)?Alfresco.AuthorityFinder.AUTHORITY_TYPE_ALL:Alfresco.AuthorityFinder.AUTHORITY_TYPE_USERS});this.widgets.addUserGroup=Alfresco.util.createYUIButton(this,"addUserGroupButton",this.onAddUserGroupButton,{type:"checkbox",checked:false});var g=E.getRegion(this.id+"-addUserGroupButton");E.setStyle(this.widgets.authorityFinder,"top",(g.bottom+4)+"px")}Alfresco.util.Ajax.jsonGet({url:Alfresco.constants.PROXY_URI+"slingshot/doclib/permissions/"+Alfresco.util.NodeRef(this.options.nodeRef).uri,successCallback:{fn:this.onPermissionsLoaded,scope:this},failureMessage:this.msg("message.permissionsGetFail")})},onNodeDetailsAvailable:function L(f,e){this.nodeData=e[1].nodeDetails;this.deferredReady.fulfil("onNodeDetailsAvailable")},onPermissionsLoaded:function A(e){var h=e.json;this.permissions={originalIsInherited:h.isInherited,isInherited:h.isInherited,canReadInherited:h.canReadInherited,inherited:h.inherited,original:Alfresco.util.deepCopy(h.direct),current:Alfresco.util.deepCopy(h.direct)};if(!this.permissions.canReadInherited){this.widgets.dtInherited.set("MSG_EMPTY",this.msg("message.empty.no-permission"))}this.inheritanceWarning=!h.isInherited;this.settableRoles=h.settable;this.settableRolesMenuData=[];for(var f=0,g=h.settable.length;f<g;f++){this.settableRoles[h.settable[f]]=true;this.settableRolesMenuData.push({text:h.settable[f],value:h.settable[f]})}this.deferredReady.fulfil("onPermissionsLoaded")},onDeferredReady:function D(){E.get(this.id+"-title").innerHTML=this.msg("title",this.nodeData.displayName);var f=this;var e=function g(j,i){var h=YAHOO.Bubbling.getOwnerByTagName(i[1].anchor,"div");if(h!==null){if(typeof f[h.className]=="function"){i[1].stop=true;var k=f.widgets.dtDirect.getRecord(i[1].target.offsetParent).getData();f[h.className].call(f,k,h)}}return true};YAHOO.Bubbling.addDefaultAction("action-link",e);this.render()},onAddUserGroupButton:function d(g,f){if(!this.showingAuthorityFinder){this.modules.authorityFinder.clearResults();E.addClass(this.widgets.authorityFinder,"active");E.addClass(this.id+"-inheritedContainer","table-mask");E.addClass(this.id+"-directContainer","table-mask");E.get(this.id+"-authorityFinder-search-text").focus();this.showingAuthorityFinder=true}else{E.removeClass(this.widgets.authorityFinder,"active");E.removeClass(this.id+"-inheritedContainer","table-mask");E.removeClass(this.id+"-directContainer","table-mask");this.showingAuthorityFinder=false}},onAuthoritySelected:function R(h,f){var g=this.sitePermissions[f[1].itemName];if(g==null){g=this.settableRoles[this.settableRoles.length-1]}this.permissions.current.push({authority:{name:f[1].itemName,displayName:f[1].displayName,iconUrl:f[1].iconUrl},role:g,created:true});this.widgets.addUserGroup.set("checked",false);E.removeClass(this.widgets.authorityFinder,"active");E.removeClass(this.id+"-inheritedContainer","table-mask");E.removeClass(this.id+"-directContainer","table-mask");this.showingAuthorityFinder=false;this.render()},fnRenderCellAuthorityIcon:function Z(){var f=this;return function e(i,h,k,m){E.setStyle(i,"width",k.width+"px");E.setStyle(i.parentNode,"width",k.width+"px");var j=h.getData("authority"),l=j.name.indexOf("GROUP_")===0,g=Alfresco.constants.URL_RESCONTEXT+"components/images/"+(l?"group":"no-user-photo")+"-64.png";if(j.avatar&&j.avatar.length!==0){g=Alfresco.constants.PROXY_URI+j.avatar+"?c=queue&ph=true"}else{if(j.iconUrl){g=j.iconUrl}}i.innerHTML='<img class="icon32" src="'+g+'" alt="icon" />'}},fnRenderCellText:function G(){var e=this;return function f(h,g,i,j){E.setStyle(h,"width",i.width+"px");E.setStyle(h.parentNode,"width",i.width+"px");h.innerHTML=X(j)}},_i18nRole:function J(e){return this.msg("roles."+e.toLowerCase())},fnRenderCellRoleText:function C(h,g,i,j){var f=this;return function e(l,k,m,n){arguments[3]=f._i18nRole(arguments[3]);f.fnRenderCellText().apply(f,arguments)}},fnRenderCellRole:function U(){var e=this;return function f(q,r,n,g){E.setStyle(q,"width",n.width+"px");E.setStyle(q.parentNode,"width",n.width+"px");var k=r.getData("role"),o=r.getData("index"),p="roles-"+r.getId(),m=[];if(!e._isRoleEditable(k)||!e.settableRoles.hasOwnProperty(k)){q.innerHTML="<span>"+X(e._i18nRole(r.getData("role")))+"</span>"}else{m=m.concat(e.settableRolesMenuData);for(var i=0,l=m.length;i<l;i++){m[i].text=e._i18nRole(m[i].value)}q.innerHTML='<span id="'+p+'"></span>';var h=new YAHOO.widget.Button({container:p,type:"menu",menu:m});h.getMenu().subscribe("click",function(s,j){return function t(w,v){var u=j[1];if(u){w.set("label",e._i18nRole(u.value));e.onRoleChanged.call(e,j[1],v)}}(h,o)});h.set("label",X(e._i18nRole(r.getData("role"))))}}},fnRenderCellActions:function M(){var e=this;return function f(i,h,j,l){var k=h.getData("role");E.setStyle(i,"width",j.width+"px");E.setStyle(i.parentNode,"width",j.width+"px");var g='<div id="'+e.id+"-actions-"+h.getId()+'" class="hidden action-set">';if(e._isRoleEditable(k)){g+='<div class="onActionDelete"><a class="action-link" title="'+e.msg("button.delete")+'"><span>'+e.msg("button.delete")+"</span></a></div>"}g+="</div>";i.innerHTML=g}},render:function I(){this._updateInheritedUI();this.widgets.dsInherited.sendRequest(this.permissions.inherited,{success:this.widgets.dtInherited.onDataReturnInitializeTable,failure:this.widgets.dtInherited.onDataReturnInitializeTable,scope:this.widgets.dtInherited});this.widgets.dsDirect.sendRequest(this.permissions.current,{success:this.widgets.dtDirect.onDataReturnInitializeTable,failure:this.widgets.dtDirect.onDataReturnInitializeTable,scope:this.widgets.dtDirect})},generateData:function H(j){var k=[],h;for(var f=0,g=j.length;f<g;f++){h=j[f];if(!h.removed&&!(h.authority.name==="GROUP_EVERYONE"&&h.role==="ReadPermissions")){k.push({index:f,authority:h.authority,displayName:h.authority.displayName,isGroup:h.authority.name.indexOf("GROUP_")==0,role:h.role})}}function e(l,i){return(!l.isGroup&&i.isGroup)?1:(l.isGroup&&!i.isGroup)?-1:(l.displayName>i.displayName)?1:(l.displayName<i.displayName)?-1:0}return k.sort(e)},_setupDataSources:function P(){this.widgets.dsInherited=new YAHOO.util.DataSource(this.generateData,{responseType:YAHOO.util.DataSource.TYPE_JSFUNCTION,scope:this});this.widgets.dsDirect=new YAHOO.util.DataSource(this.generateData,{responseType:YAHOO.util.DataSource.TYPE_JSFUNCTION,scope:this})},_setupDataTables:function B(){var e=(this.options.showGroups)?this.msg("column.authority"):this.msg("column.user");var f=[{key:"icon",label:"",sortable:false,formatter:this.fnRenderCellAuthorityIcon(),width:32},{key:"displayName",label:e,sortable:false},{key:"role",label:this.msg("column.role"),sortable:false,formatter:this.fnRenderCellRoleText(),width:240}];this.widgets.dtInherited=new YAHOO.widget.DataTable(this.id+"-inheritedPermissions",f,this.widgets.dsInherited,{initialLoad:false,MSG_EMPTY:this.msg("message.empty"),MSG_LOADING:this.msg("message.loading")});f=[{key:"icon",label:"",sortable:false,formatter:this.fnRenderCellAuthorityIcon(),width:32},{key:"displayName",label:e,sortable:false},{key:"role",label:this.msg("column.role"),sortable:false,formatter:this.fnRenderCellRole(),width:240},{key:"actions",label:this.msg("column.actions"),sortable:false,formatter:this.fnRenderCellActions(),width:120}];this.widgets.dtDirect=new YAHOO.widget.DataTable(this.id+"-directPermissions",f,this.widgets.dsDirect,{initialLoad:false,MSG_EMPTY:this.msg("message.empty"),MSG_LOADING:this.msg("message.loading")});this.widgets.dtDirect.subscribe("rowMouseoverEvent",this.onEventHighlightRow,this,true);this.widgets.dtDirect.subscribe("rowMouseoutEvent",this.onEventUnhighlightRow,this,true)},_isRoleEditable:function K(e){return this.permissions.isInherited||!Alfresco.util.arrayContains(this.options.nonEditableRoles,e)},onEventHighlightRow:function T(e){this.widgets.dtDirect.onEventHighlightRow.call(this.widgets.dtDirect,e);E.removeClass(this.id+"-actions-"+e.target.id,"hidden")},onEventUnhighlightRow:function a(e){this.widgets.dtDirect.onEventUnhighlightRow.call(this.widgets.dtDirect,e);E.addClass(this.id+"-actions-"+e.target.id,"hidden")},onRoleChanged:function Q(h,g){var f=this.permissions.current[g],e=this.permissions.original;f.role=h.value;f.modified=(g<=e.length&&e[g]!=null&&f.role!==e[g].role)},onActionDelete:function Y(f){var e=this.permissions.current[f.index];e.removed=true;this.render()},onSaveButton:function F(k,e){this.widgets.saveButton.set("disabled",true);var j=[],h;for(var f=0,g=this.permissions.current.length;f<g;f++){h=this.permissions.current[f];if((h.created&&!h.removed)||(!h.created&&(h.removed||h.modified))){if(h.modified&&!h.created){j.push({authority:h.authority.name,role:this.permissions.original[f].role,remove:true})}j.push({authority:h.authority.name,role:h.role,remove:h.removed})}}if(j.length>0||this.permissions.isInherited!==this.permissions.originalIsInherited){Alfresco.util.Ajax.jsonPost({url:Alfresco.constants.PROXY_URI+"slingshot/doclib/permissions/"+Alfresco.util.NodeRef(this.options.nodeRef).uri,dataObj:{permissions:j,isInherited:this.permissions.isInherited},successCallback:{fn:function(i){this._navigateForward()},scope:this},failureCallback:{fn:function(i){var l=Alfresco.util.parseJSON(i.serverResponse.responseText);Alfresco.util.PopupManager.displayPrompt({title:this.msg("message.failure"),text:this.msg("message.failure.text",l.message)});this.widgets.saveButton.set("disabled",false)},scope:this}})}else{this._navigateForward()}},onCancelButton:function S(f,e){this.widgets.cancelButton.set("disabled",true);this._navigateForward()},_navigateForward:function c(){window.history.go(-1)}})})();