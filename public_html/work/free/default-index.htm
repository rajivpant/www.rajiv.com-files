<SCRIPT LANGUAGE=VBScript RUNAT=Server>

' File Name:	default.asp
' Language:	VBScript (Server Side)
' Purpose:	Allows multiple default documents in Microsoft IIS WWW Service.
' Requires:	Microsoft IIS 3.0 with Active Server Pages.

' Author:	Rajiv Pant (Betul)   betul@rajiv.com   http://rajiv.org

' A better soultion than this would be use an ISAPI filter DLL to enable
' multiple default documents. I will post an example of that here.

' How to use:	Set your IIS default document to the name of this file.
'		(You can give any name to this file.) Then have a script
'		place a copy of this file in every folder under your document
'		root. (That is why the ISAPI version I'm writing is a better solution.)

' Note:		You may want to modify this program to go through a list
'		of default documents taking different kinds of actions for
'		that type of default document.
'		This system is useful for NT/IIS based ISPs that host many
'		people's sites, some of which may be migrating from Unix
'		based web servers. This way, people can continue using the
'		default documents they were used to.



On Error Resume Next


doc = "index.html"	' We first look for index.html


set FileObject = Server.CreateObject ("Scripting.FileSystemObject")


Selected = FALSE

while NOT Selected
  strFilename = Server.MapPath (doc)	' The physical path to the file doc

  Err.clear
  set oInStream = FileObject.OpenTextFile (strFilename, 1, FALSE, FALSE)

  If (Err.number > 0) then

    Select Case doc

      ' If index.html is not found, we look for index.stm
      Case "index.html"		doc = "index.stm"

      ' If index.stm is not found, we look for index.shtml
      Case "index.stm"		doc = "index.shtml"

      ' If index.shtml is not found, we look for index.htm
      Case "index.shtml"	doc = "index.htm"

      ' If index.htm is not found, we look for default.htm
      Case "index.htm"		doc = "default.htm"

      ' If default.htm is not found, we look for index.txt
      Case "default.htm"	doc = "index.txt"

      ' If index.txt is not found, we look for index.asp
      Case "index.txt"		doc = "index.asp"

      ' If even the last default document in our list is not found,
      ' we set doc to empty and use that to take certain action later.
      Case Else			doc = ""
				Selected = TRUE


    End Select

  Else Selected = TRUE

  End If
Wend


If doc = "" Then
  ' Now we could either display the directory like many web servers do,
  ' or we could just give a message as we do below.
  Response.Write ("No default document found.<br>")
Else

  If doc = "index.html" or doc = "index.htm" or doc = "default.htm" Then

    ' For .html, .htm, and other non-server-parsed files,
    ' open the file and print out it's contents. This way, the URL will
    ' not change and the browser will not have to do a redirection.

    ' Response.Write ("Displaying ")	' For testing
    ' Response.Write (doc)		' For testing

    While NOT oInstream.AtEndOfStream
      Response.Write (oInstream.Readline)
      oInstream.Skipline()
    Wend

    Set oInstream = nothing

  Else		' server-parsed or some other type of document


  ' For .stm, .shtml, .asp, .htx and other server-parsed or other files, redirect
  ' the browser to that file.

  ' Response.Write ("Redirecting to ")	' For testing
  ' Response.Write (doc)		' For testing

  Response.Redirect (doc)

  End If	' server-parsed or non-server-parsed document


End If

</SCRIPT>


