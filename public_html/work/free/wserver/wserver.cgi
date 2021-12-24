#!/usr/local/bin/perl
# Program Name:	wserver.cgi

# Author:	Rajiv Pant (Betul)  betul@rajiv.com  http://rajiv.org

# what web server software is that site running ?
# get head information

$| = 1 ; print <<EOM;
Content-type: text/html

<html>
<head><title>What web server software is that site running ?</title></head>
<body bgcolor="#ffffff">

<!-- programmed by Rajiv Pant (Betul) betul\@rajiv.org http://rajiv.org -->

EOM

&parse_form_data (*INPUT) ;

($server, $port) = ($INPUT{'server'}, $INPUT{'port'}) ;
$port = 80 unless $port ;

# important. the following variables are passed to a unix command line.
# therefore removing any unwanted characters.

$server =~ s/[^A-Za-z0-9\.\-]//g ;
$port   =~ s/\D//g ;

&find_out if $server ;
&input ;

print <<EOM;
<hr>
<a href="http://rajiv.org/programming/wserver.txt">Source code</a>
for this program.

EOM

#print <<EOM;
#</body>
#</html>
#EOM
open (FOOTER, "t/footer.htm") ;
while (<FOOTER>)
  {
  s{href="../}{href="http://rajiv.org/}g ;
  s{href="(?!(http://|mailto:))}{href="http://rajiv.org}g ;
  print ;
  }
close (FOOTER) ;

sub find_out
{
use Socket ;
$sockaddr = 'S n a4 x8' ;
$this_hostname = `/bin/hostname` ;
 
($name, $aliases, $proto) = getprotobyname('tcp') ;
($name, $aliases, $port) = getservbyname($port, 'tcp') unless $port =~ /^\d+$/;
($name, $aliases, $type, $len, $thisaddr) = gethostbyname($this_hostname) ;
($name, $aliases, $type, $len, $thataddr) = gethostbyname($server) ;
 
$this = pack($sockaddr, &AF_INET, 0, $thisaddr) ;
$that = pack($sockaddr, &AF_INET, $port, $thataddr) ;
 
socket(WSERVER_GET, &PF_INET, &SOCK_STREAM, $proto)
  || &socket_error ('socket') ;
 
bind(WSERVER_GET, $this) || socket_error ('bind') ;
connect(WSERVER_GET, $that) || socket_error ('connect') ;
 
select(WSERVER_GET) ; $| = 1; select(STDOUT) ;

print WSERVER_GET <<EOM;
HEAD / HTTP/1.0

EOM

while (<WSERVER_GET>)
  {
  /^Server: (.*)$/ ;
  $server_software = $1 if $1 ;
  }

close (WSERVER_GET) ;

$server_software ?

(print <<EOM)
http://$server:$port is running the following web server software:<br>
<big>$server_software</big>
EOM

: (print <<EOM);
http://$server:$port did not report what web server software it is running.
This could have resulted from a network connection failiure or the server
being down. You may want to try again.
EOM

print <<EOM;
<hr>
EOM
}



sub socket_error
{
my ($error) = @_ ;
print <<EOM;
I got a Network Connection Error while connecting to $server port $port.<br>
Keyword: $error
<p>
Please press back on your browser and try again later.
EOM
exit ;
}




sub input
{
print <<EOM;
<i>Want to find out what web server software that site is running ?<br>
Microsoft Internet Information Server, Apache, Netscape or some other ?</i><p>

<form action="$ENV{SCRIPT_NAME}" method=GET>
Enter the name of the site to ask below: (eg. www.phillynews.com)<br>
<input name=server	value=""	type=text	size=48><br>
For almost all sites, the port number should be 80.
If it is some other for the site you want to ask, change it below:<br>
<input name=port	value="80"	type=text	size=4><p>
<input name=action	value="Tell me"	type=submit>
</form>
Disclaimer: <i>This information is not guaranteed to be true.</i>
EOM
}


# --- program listing ends here ---



# CGI parsing subroutines. These should be called from a common CGI library,
# but are pasted here in this example.


sub url_decode
{
foreach (@_)
  {
  tr/+/ /;
  s/%(..)/pack("c",hex($1))/ge;
  }
@_;
}




sub parse_form_data
{
local (*FORM_DATA) = @_ ;

local ($request_method, $query_string, @key_value_pairs,
	$key_value, $key, $value );

$request_method = $ENV{'REQUEST_METHOD'} ;

if ($request_method eq "GET")
  {
  $query_string = $ENV{'QUERY_STRING'} ;
  }
elsif ($request_method eq "POST")
  {
  read (STDIN, $query_string, $ENV{'CONTENT_LENGTH'}) ;
  }
else
  {
  &return_error (500, "Server Error",
  "Unsupported Method: $request_method. I only know GET and POST.") ;
  }

@key_value_pairs = split (/&/, $query_string) ;

foreach $key_value (@key_value_pairs)
  {
  ($key, $value) = split (/=/, $key_value) ;
  $value =~ tr/+/ / ;
  $value =~ s/%([\dA-Fa-f][\dA-Fa-f])/pack ("C", hex ($1))/eg ;

  if ( defined ($FORM_DATA{$key} ) )
    {
    $FORM_DATA{$key} = join ("\0", $FORM_DATA{$key}, $value) ;
    }
  else
    {
    $FORM_DATA{$key} = $value ;
    }
  }
} # eo &parse_form_data ;






# this subroutine converts the given string to it's url encoded form.
# it converts everything but perl's \W and the space char. Even the &
# is converted so that the encoded string may be saved as a nice file name.

sub encode_as_url
{
($_) = @_ ; s/([^\w ])/&char_2_hex_digits($1)/eg ; s/ /+/g ; return $_ ;
}



# this returns the two digit hex code for the given character.
# it is used by the encode_as_url subroutine

sub char_2_hex_digits
{
my ($c, @hex_digit) = (ord($_[0]), ('0'..'9', 'a'..'f') ) ;
return '%' . $hex_digit[$c >> 4] . $hex_digit[$c & 15] ; 
}



sub return_error
{
my ($status, $subject, $message) = @_ ;

($status) && print <<EOH;
Content-type: text/html
Status: $status $subject

EOH
  
print <<EOE;
<html>
<head>
<title>
$subject
</title>
</head>

<body>

<h3><font color="#de0031">$subject</font></h3>

$message

<p>
<hr>
[ Press back to return ]
[ <a href="$webmaster">$webmaster</a> ]

</body>
</html>

EOE

exit ;
} # eo &return_error

# by Rajiv Pant (Betul)  betul@rajiv.com  http://rajiv.org
