/**
  include_url.java

  Designed and Implemented by
  @author Rajiv Pant (Betul)  betul@rajiv.org  http://rajiv.org
  @version 1.2

  v.1.0 1997/Mar/11
  v.1.2 1999/Mar/16

  For a description of this object's purpose and how to use it,
  look at the test-include_url.asp file included inside a comment
  at the end of this source code.

  To use this object you need:

  * Windows NT Server 4.0 running
  Internet Information Server 3.0 with Active Server Pages.

  * Microsoft Java VM (Virtual Machine) for Windows version
  build 1257 or later.

  * javareg.exe which comes with the freely available MS SDK for Java
  or with MS Visual J++.


  To install it for use on your server, follow these steps:

  * Compile this include_url.java program to include_url.class
  java bytecode. You can do this using MS Visual J++, Symantec
  Visual Cafe, some other java compiler, or using the "jvc /O" from
  the Microsoft Java SDK or "javac -o include_url.java" from the
  Sun JDK (Java Development Kit). Then you may want to test it by
  running it as a stand-alone java program. You can do this from your
  Java Development Environment like J++ or Cafe or simply by
  entering "include_url.class" at the CMD prompt provided your
  .class files are associated with the MS Java VM as they should be.

  * Place the complied java class include_url.class in your
  \winnt\java\trustlib folder. You can use the
  "copy include_url.class \winnt\java\trustlib\" command at
  the CMD prompt to do this or you can drag and drop.

  * Register this object as an Active Server Objcet using the
  javareg.exe command. You can enter:
  "javareg /register /class:include_url /progid:include_url"

  * Stop and start IIS.

  * Try out this object using the sample test-include_url.asp
  asp page at the end of this source code listing.


  Tip: Before compling the final version of any program for
  installation, remember to turn debugging off and set optimizations
  in your development environment such as Visual J++ or Cafe.
*/


import java.net.* ;
import java.io.* ;
import java.util.Properties ;

public class include_url {



final static boolean DEBUG = false ;
// final static boolean DEBUG = true ;



final static boolean USE_HTTP_PROXY = false ;
// final static boolean USE_HTTP_PROXY = true ;

final static String HTTP_PROXY_HOST = "10.10.10.10" ;



final static int PAGE_BUFFER_SIZE = 32767 ;



final static String NEWLINE = "\r\n" ;








	
	public String display(String url_to_include)
	{
		

		if (USE_HTTP_PROXY) {
			Properties p = new Properties(System.getProperties());
			p.put("http.proxyHost", HTTP_PROXY_HOST) ;
			System.setProperties(p) ;
		}
		
		StringBuffer output = new StringBuffer( PAGE_BUFFER_SIZE ) ;
		
		try {
			
			URL u = new URL (url_to_include) ;
			
			if (DEBUG == true) {
				output.append( u.toString() ) ;
			}

			
			BufferedReader r = new BufferedReader( new InputStreamReader(u.openStream()) ) ;
			
			String l ;
			
			while ( ( l = r.readLine () ) != null ) {
				output.append( l ) ;
				output.append ( NEWLINE ) ;
			}
			
		} catch (Exception e) {
			output = new StringBuffer (
				"Error trying to include remote URL:"
				 + e.toString() ) ;
		}
		
		
		return output.toString() ;
		
	} // end of method display( String )
	

	// The main method is provided so that you can test this
	// object from the command line. You may want to not have
	// the main function in the final to-be-installed version.

	public static void main (String[] args) {
		
		include_url iu = new include_url() ;
		
		String d = iu.display (args[0]) ;
		
		System.out.println ( d );
	}


} // end of class include_url


/* --- Cut here. --- File test-include_url.asp begins on next line.
<%

' File Name:	test-include_url.asp
' Author:	Rajiv Pant (Betul)  betul@rajiv.org  http://rajiv.org


' How to use:
'
' The two lines at the end of this file show how to use the
' include_url object from an asp page.


' Description:	
'
' This .asp (Active Server Page) demonstrates the use of the
' include_url Active Server Component written by Betul.
'
' Since Server Parsed HTML (.sthml, .stm) or Server Side Includes (SSI)
' does not provide a mechanism to "include" a remote url, this object 
' can be used to do just that.	
'
' This component was created to demonstrate how to use Java to
' to create Active Server Objects that can be called from asp pages.
' The advantage of using Java via asp is that most of the code
' becomes easily portable to other environments. So if you move
' from the ActiveX server to another server environment, you won't
' have to re-create your core server applications.
'
' Practical applications of this:
'
' * To include the output of a CGI from another server of yours.
' For example, you wrote this CGI on your Unix server that you
' can't port to your new NT server just yet, so you still run it
' off your unix server but not directly, you "include" it in some
' page in your NT server which does other things too. It could be
' your advertisement rotation cgi or something.
'
' * This object can easily be extended to behave like a proxy server
' so that remotely included pages can be parsed and modified before
' displaying so that the links to local urls, images and other objects
' on the pages are converted to remote ones so that the links work
' and the images show up. As it is, this object does not do that.
' I may do that in some program I use to illustrate html-parsing using
' Java.

%>
<% Set include_url = Server.CreateObject ("include_url") %>
<% = include_url.display("http://rajiv.org/") %>
--- Cut here. --- File test-include_url.asp ends on previous line. */

